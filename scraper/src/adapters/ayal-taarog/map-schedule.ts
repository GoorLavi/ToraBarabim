import type { RawLesson } from '../models';
import { parseDate } from '../../normalize/date';
import type { ScheduleImage, ScheduleImageRow } from '../../vision/models';
import { RABBI_NAME } from './consts';

const toPlaceRaw = (row: ScheduleImageRow): string | undefined => {
  if (!row.venueName) return undefined;
  return row.address ? `${row.venueName}, ${row.address}` : row.venueName;
};

// "9.8" carries no year on the poster. Anchoring it against the week the
// poster itself declares, rather than the day the scraper happens to run,
// keeps a delayed or re-run scrape from resolving the wrong year.
const toFullDateRaw = (dateLabel: string, periodStartIso: string): string | undefined => {
  const iso = parseDate(dateLabel, periodStartIso);
  if (!iso) return undefined;
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
};

// A poster row's time badge tells us whether it is recurring (weekday, no
// date) or one-time (date, no weekday). When the model could not read the
// badge, neither is emitted: the lesson is still reported, with its
// recurrence left as a gap for a human, rather than guessed.
const toRecurrenceFields = (
  row: ScheduleImageRow,
  periodStartIso: string,
): { weekdayRaw?: string; dateRaw?: string } => {
  if (row.isRecurringMarker === true) return { weekdayRaw: row.dayLabel };
  if (row.isRecurringMarker === false) {
    return { dateRaw: row.dateLabel ? toFullDateRaw(row.dateLabel, periodStartIso) : undefined };
  }
  return {};
};

const toRawLesson = (row: ScheduleImageRow, periodStartIso: string, audienceRaw: string | undefined): RawLesson | undefined => {
  if (!row.startTime || !row.venueName) return undefined;

  const { weekdayRaw, dateRaw } = toRecurrenceFields(row, periodStartIso);

  return {
    sourceItemId: `${row.dayLabel ?? ''}:${row.dateLabel ?? ''}:${row.startTime}:${row.venueName}`,
    rabbiNameRaw: RABBI_NAME,
    weekdayRaw,
    dateRaw,
    startTimeRaw: row.startTime,
    endTimeRaw: row.endTime,
    placeRaw: toPlaceRaw(row),
    cityRaw: row.city,
    topicRaw: row.topic,
    audienceRaw,
  };
};

// Resolves the ISO date the poster's own declared period starts on, using
// today only to anchor which year that yearless period falls in.
export const resolvePeriodStartIso = (periodLabel: string | undefined, todayIso: string): string => {
  const startLabel = periodLabel?.split('-')[0]?.trim();
  if (!startLabel) return todayIso;
  return parseDate(startLabel, todayIso) ?? todayIso;
};

export const mapScheduleImageToRawLessons = (schedule: ScheduleImage, todayIso: string): RawLesson[] => {
  const periodStartIso = resolvePeriodStartIso(schedule.periodLabel, todayIso);

  return schedule.rows
    .map((row) => toRawLesson(row, periodStartIso, schedule.audienceNote))
    .filter((lesson): lesson is RawLesson => lesson !== undefined);
};
