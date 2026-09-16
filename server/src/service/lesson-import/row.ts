import { todayInIsrael } from '../lesson/israel-time';
import { cleanCityText, cleanWeekdayText, resolveBuiltInCityAlias, resolveWeekday, resolveWeekdayNote, weekdayOfIsoDate } from './clean';
import {
  BROADCAST_ONLY_DELIVERY_TYPE,
  BUILT_IN_AUDIENCE_ALIASES,
  BUILT_IN_TIME_KIND_NOTES,
  BUILT_IN_TOPIC_ALIASES,
  DEFAULT_LESSON_DURATION_MINUTES,
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
  PHYSICAL_DELIVERY_TYPES,
} from './consts';
import type { LearnedRules, LessonImportRowInput, NormalizedRow, RowRecurrence, SkippedRow } from './models';

export const emptyLearnedRules = (): LearnedRules => ({
  cityAlias: new Map(),
  timeKind: new Map(),
  audienceAlias: new Map(),
  topicAlias: new Map(),
});

const parseMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * MINUTES_PER_HOUR + (minutes ?? 0);
};

// An end time before the start time wraps past midnight (a lesson that
// crosses it). An end time equal to the start time is not a 24-hour
// lesson, it is a source that filled in a placeholder end time equal to
// the start; the default duration applies instead.
const durationFromTimes = (startTime: string, endTime: string): number => {
  const diff = parseMinutes(endTime) - parseMinutes(startTime);
  if (diff === 0) return DEFAULT_LESSON_DURATION_MINUTES;
  return diff > 0 ? diff : diff + MINUTES_PER_DAY;
};

const skip = (raw: LessonImportRowInput, reason: string): SkippedRow => ({ raw, reason });

// Pure: given a raw row, the built-in maps, the learned rules, and a way to
// resolve a cleaned city name to its `cities.code` (built once by the
// caller, never queried per row), decides whether the row becomes a lesson
// or is skipped, and why. Implements the row rules in the plan's section 6.
export const normalizeRow = (
  row: LessonImportRowInput,
  rules: LearnedRules,
  resolveCityCode: (cleanedCityName: string) => number | undefined,
  now: Date,
): NormalizedRow | SkippedRow => {
  const weekdayFromText = resolveWeekday(row.weekday);
  if (weekdayFromText === undefined) return skip(row, `unknown_weekday:${cleanWeekdayText(row.weekday)}`);
  const weekdayNote = resolveWeekdayNote(row.weekday);

  if (row.date) {
    const weekdayFromDate = weekdayOfIsoDate(row.date);
    if (weekdayFromDate !== weekdayFromText) return skip(row, 'weekday_date_mismatch');
  }

  const recurrenceText = row.recurrence?.trim();
  let recurrence: RowRecurrence;
  if (recurrenceText === 'קבוע') {
    recurrence = { kind: 'weekly', weekday: weekdayFromText };
  } else if (recurrenceText === 'משתנה') {
    if (!row.date) return skip(row, 'once_missing_date');
    recurrence = { kind: 'once', date: row.date, weekday: weekdayFromText };
  } else if (!recurrenceText) {
    recurrence = row.date ? { kind: 'once', date: row.date, weekday: weekdayFromText } : { kind: 'weekly', weekday: weekdayFromText };
  } else {
    return skip(row, `unknown_recurrence:${recurrenceText}`);
  }

  if (recurrence.kind === 'once' && recurrence.date < todayInIsrael(now)) return skip(row, 'past_one_off');
  if (row.startTime === '00:00') return skip(row, 'midnight_placeholder');

  if (!PHYSICAL_DELIVERY_TYPES.has(row.deliveryType)) {
    if (row.deliveryType === BROADCAST_ONLY_DELIVERY_TYPE) return skip(row, 'broadcast_only');
    return skip(row, `unknown_delivery_type:${row.deliveryType}`);
  }

  const timeKindNote = Object.prototype.hasOwnProperty.call(BUILT_IN_TIME_KIND_NOTES, row.timeKind)
    ? BUILT_IN_TIME_KIND_NOTES[row.timeKind]
    : rules.timeKind.get(row.timeKind)?.note;
  const timeKindKnown = Object.prototype.hasOwnProperty.call(BUILT_IN_TIME_KIND_NOTES, row.timeKind) || rules.timeKind.has(row.timeKind);
  if (!timeKindKnown) return skip(row, `unknown_time_kind:${row.timeKind}`);

  const notes = [weekdayNote, timeKindNote].filter((note): note is string => Boolean(note)).join(' ') || undefined;

  const durationMinutes = row.endTime ? durationFromTimes(row.startTime, row.endTime) : DEFAULT_LESSON_DURATION_MINUTES;

  // Unstated (no text at all) is not a claim of 'men': it stays
  // `undefined` here, and the planner resolves it to the owner's default
  // (men). A *stated* audience that matches nothing, built-in or learned,
  // is still unknown and skips.
  const audienceText = row.audience?.trim();
  let audience: (typeof BUILT_IN_AUDIENCE_ALIASES)[string] | undefined;
  if (audienceText) {
    audience = BUILT_IN_AUDIENCE_ALIASES[audienceText] ?? rules.audienceAlias.get(audienceText);
    if (!audience) return skip(row, `unknown_audience:${audienceText}`);
  }

  let topic: (typeof BUILT_IN_TOPIC_ALIASES)[string] | undefined;
  let title: string | undefined;
  if (row.topic) {
    const cleanedTopic = row.topic.trim();
    topic = BUILT_IN_TOPIC_ALIASES[cleanedTopic] ?? rules.topicAlias.get(cleanedTopic);
    if (!topic) title = row.topic.trim();
  }

  if (!row.city) return skip(row, 'unrecognised_city');
  const cleanedCity = cleanCityText(row.city);
  const aliasedCityName = resolveBuiltInCityAlias(cleanedCity);
  const cityCode = resolveCityCode(cleanedCity) ?? (aliasedCityName ? resolveCityCode(aliasedCityName) : undefined) ?? rules.cityAlias.get(cleanedCity)?.cityCode;
  if (cityCode === undefined) return skip(row, `unrecognised_city:${cleanedCity}`);

  if (!row.street) return skip(row, 'missing_street');

  return {
    raw: row,
    rabbiName: row.rabbiName,
    place: row.place,
    street: row.street,
    cityCode,
    title,
    topic,
    audience,
    recurrence,
    startTime: row.startTime,
    durationMinutes,
    notes,
    sources: row.sources,
    needsReview: row.needsReview,
  };
};
