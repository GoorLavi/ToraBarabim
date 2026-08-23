import type { Area, Lesson, LessonException, LessonPlace, Place, Rabbi, Weekday } from '@torabarabim/common';
import { and, eq, gte, inArray, lte } from 'drizzle-orm';

import { db } from '../../db/client';
import { cities, lessonExceptions, lessons, rabbis } from '../../db/schema';
import { DEFAULT_RANGE_DAYS, MAX_RANGE_DAYS, TEXT_SEARCH_RANGE_DAYS } from './consts';
import { InvalidDateRangeError } from './errors';
import { addDays, compareIsoDates, daysBetween, todayInIsrael } from './israel-time';
import type {
  LessonSearchQuery,
  LessonSearchResult,
  ResolvedLessonOccurrence,
  ResolvedLessonSearchQuery,
} from './models';
import { applyException, expandLesson, type ResolvedOccurrence } from './occurrence';

const MINUTES_PER_DAY = 24 * 60;

// Hebrew has no case, but lower-casing also lets a stray Latin fragment (a
// transliterated name) match; a plain substring, never a fuzzy or scored match.
const includesQuery = (value: string, q: string): boolean => value.toLowerCase().includes(q.toLowerCase());

const addMinutes = (startTime: string, minutes: number): string => {
  const [hoursText, minutesText] = startTime.split(':');
  const total = Number(hoursText) * 60 + Number(minutesText) + minutes;
  const wrapped = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const resolveRange = (query: LessonSearchQuery, now: Date): ResolvedLessonSearchQuery => {
  const today = todayInIsrael(now);
  const from = query.from ?? today;
  // A text search with no caller-picked `to` widens to the project's
  // two-week window instead of the ordinary default, so typing a rabbi's
  // name surfaces his lessons across the next two weeks rather than just
  // whatever the date filter happened to be set to.
  const defaultRangeDays = query.q ? TEXT_SEARCH_RANGE_DAYS : DEFAULT_RANGE_DAYS;
  const to = query.to ?? addDays(from, defaultRangeDays);

  if (compareIsoDates(to, from) < 0) {
    throw new InvalidDateRangeError(`expected 'to' on or after 'from', got from=${from} to=${to}`);
  }

  const rangeDays = daysBetween(from, to);
  if (rangeDays > MAX_RANGE_DAYS) {
    throw new InvalidDateRangeError(
      `expected a range of at most ${MAX_RANGE_DAYS} days, got from=${from} to=${to} (${rangeDays} days)`,
    );
  }

  return { ...query, from, to };
};

type LessonRow = typeof lessons.$inferSelect;
type ExceptionRow = typeof lessonExceptions.$inferSelect;
type CityRow = { code: number; nameHe: string; area: Area };

const toLessonDomain = (row: LessonRow): Lesson => ({
  id: row.id,
  title: row.title ?? undefined,
  rabbiId: row.rabbiId,
  place: {
    name: row.placeName,
    street: row.placeStreet,
    floor: row.placeFloor ?? undefined,
    cityCode: row.cityCode,
  },
  topic: row.topic ?? undefined,
  audience: row.audience,
  // The `lessons_recurrence_shape` check constraint guarantees weekdays is
  // set for 'weekly' and date is set for 'once'; TS cannot see a DB constraint.
  recurrence:
    row.recurrenceKind === 'weekly'
      ? { kind: 'weekly', weekdays: row.recurrenceWeekdays as Weekday[] }
      : { kind: 'once', date: row.recurrenceDate as string },
  startTime: row.startTime,
  durationMinutes: row.durationMinutes,
  notes: row.notes ?? undefined,
});

const toExceptionDomain = (row: ExceptionRow): LessonException =>
  row.kind === 'cancelled'
    ? { kind: 'cancelled', lessonId: row.lessonId, date: row.date, reason: row.reason ?? undefined }
    : {
        kind: 'modified',
        lessonId: row.lessonId,
        date: row.date,
        startTime: row.startTime ?? undefined,
        place:
          row.placeName !== null && row.placeStreet !== null && row.cityCode !== null
            ? { name: row.placeName, street: row.placeStreet, floor: row.placeFloor ?? undefined, cityCode: row.cityCode }
            : undefined,
        substituteRabbiId: row.substituteRabbiId ?? undefined,
        note: row.note ?? undefined,
      };

// Resolves a lesson's (or an exception's override) `LessonPlace` into the
// public `Place` shape by looking up its city, the one join a venue ever
// needs since it carries everything else as its own text.
const toPlace = (place: LessonPlace, cityByCode: Map<number, CityRow>): Place => {
  const city = cityByCode.get(place.cityCode);
  if (!city) {
    throw new Error(`data inconsistency: a lesson references unknown city code ${place.cityCode}`);
  }
  return { name: place.name, street: place.street, floor: place.floor, city: city.nameHe, area: city.area };
};

type RabbiRow = typeof rabbis.$inferSelect;

const toRabbi = (row: RabbiRow): Rabbi => ({
  id: row.id,
  name: row.name,
  title: row.title ?? undefined,
  photoUrl: row.photoUrl ?? undefined,
  bio: row.bio ?? undefined,
});

const STATUS_ORDER = { scheduled: 0, cancelled: 1 } as const;

// Cancelled occurrences stay in the result and sort after scheduled ones
// on the same day; the client dims them rather than the API hiding them.
const compareOccurrences = (a: ResolvedOccurrence, b: ResolvedOccurrence): number => {
  const byDate = compareIsoDates(a.date, b.date);
  if (byDate !== 0) return byDate;

  const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  if (byStatus !== 0) return byStatus;

  return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0;
};

const resolveRecord = (
  occurrence: ResolvedOccurrence,
  rabbiById: Map<string, Rabbi>,
  cityByCode: Map<number, CityRow>,
): ResolvedLessonOccurrence => {
  const rabbi = rabbiById.get(occurrence.lesson.rabbiId);
  if (!rabbi) {
    throw new Error(`data inconsistency: lesson ${occurrence.lesson.id} references unknown rabbi ${occurrence.lesson.rabbiId}`);
  }

  return {
    lessonId: occurrence.lesson.id,
    date: occurrence.date,
    startTime: occurrence.startTime,
    endTime: addMinutes(occurrence.startTime, occurrence.lesson.durationMinutes),
    status: occurrence.status,
    title: occurrence.lesson.title,
    topic: occurrence.lesson.topic,
    audience: occurrence.lesson.audience,
    rabbi,
    place: toPlace(occurrence.place, cityByCode),
    substituteRabbi: occurrence.substituteRabbiId
      ? rabbiById.get(occurrence.substituteRabbiId)
      : undefined,
    cancellationReason: occurrence.cancellationReason,
    note: occurrence.note,
  };
};

// `now` is read once here, at the edge, and threaded through; nothing else
// in this module reads the clock directly.
export const search = async (rawQuery: LessonSearchQuery, now: Date): Promise<LessonSearchResult> => {
  const query = resolveRange(rawQuery, now);

  // Rabbis and cities are small reference tables, loaded whole so that
  // resolving a substitute rabbi or an exception's overridden venue never
  // needs a second round trip per occurrence.
  const [rabbiRows, cityRows] = await Promise.all([
    db.select().from(rabbis),
    db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area }).from(cities),
  ]);

  const rabbiById = new Map(rabbiRows.map((row) => [row.id, toRabbi(row)] as const));
  const cityByCode = new Map(cityRows.map((row) => [row.code, row] as const));

  const eligibleCityCodes =
    query.area !== undefined ? cityRows.filter((row) => row.area === query.area).map((row) => row.code) : undefined;

  if (eligibleCityCodes?.length === 0) {
    return { items: [], page: query.page, pageSize: query.pageSize, total: 0 };
  }

  // `q` searches the rabbi's name, the lesson's own venue name, and the
  // city's Hebrew name, OR'd together, then combined with every other
  // filter as AND. Rabbis and cities are already loaded whole above, so
  // matching a rabbi or a city happens against those in-memory rows.
  const q = query.q || undefined;
  const matchingRabbiIds = q ? rabbiRows.filter((row) => includesQuery(row.name, q)).map((row) => row.id) : undefined;
  const matchingCityCodes = q ? cityRows.filter((row) => includesQuery(row.nameHe, q)).map((row) => row.code) : undefined;

  const conditions = [
    query.rabbiId ? eq(lessons.rabbiId, query.rabbiId) : undefined,
    query.topic ? eq(lessons.topic, query.topic) : undefined,
    query.audience ? eq(lessons.audience, query.audience) : undefined,
    query.city !== undefined ? eq(lessons.cityCode, query.city) : undefined,
    eligibleCityCodes ? inArray(lessons.cityCode, eligibleCityCodes) : undefined,
  ].filter((condition) => condition !== undefined);

  const lessonRows = await db
    .select()
    .from(lessons)
    .where(conditions.length ? and(...conditions) : undefined);

  const matchingRows = q
    ? lessonRows.filter(
        (row) =>
          (matchingRabbiIds?.includes(row.rabbiId) ?? false) ||
          includesQuery(row.placeName, q) ||
          (matchingCityCodes?.includes(row.cityCode) ?? false),
      )
    : lessonRows;

  const lessonDomainById = new Map(matchingRows.map((row) => [row.id, toLessonDomain(row)] as const));
  const lessonIds = [...lessonDomainById.keys()];

  const exceptionRows = lessonIds.length
    ? await db
        .select()
        .from(lessonExceptions)
        .where(
          and(
            inArray(lessonExceptions.lessonId, lessonIds),
            gte(lessonExceptions.date, query.from),
            lte(lessonExceptions.date, query.to),
          ),
        )
    : [];

  const exceptionByKey = new Map(
    exceptionRows.map((row) => [`${row.lessonId}:${row.date}`, toExceptionDomain(row)] as const),
  );

  const occurrences = [...lessonDomainById.values()]
    .flatMap((lesson) => expandLesson(lesson, query.from, query.to))
    .map((raw) => applyException(raw, exceptionByKey.get(`${raw.lesson.id}:${raw.date}`)))
    .sort(compareOccurrences);

  const total = occurrences.length;
  const start = (query.page - 1) * query.pageSize;
  const items = occurrences
    .slice(start, start + query.pageSize)
    .map((occurrence) => resolveRecord(occurrence, rabbiById, cityByCode));

  return { items, page: query.page, pageSize: query.pageSize, total };
};
