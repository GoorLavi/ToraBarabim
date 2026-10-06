import type { Area, AudienceScope, RabbiHonorific } from '@torabarabim/common';
import { and, eq, gte, inArray, lte } from 'drizzle-orm';

import { db } from '../../db/client';
import { cities, lessonExceptions, lessons, places, rabbis } from '../../db/schema';
import { audienceScopeOfRabbi, isLessonInScope, matchesAudienceFilter } from '../shared/audience-scope';
import { rabbiNameMatcher } from '../shared/rabbi-name-match';
import { toRabbiSummary as toRabbi } from '../shared/rabbi-summary';
import { MAX_ITEMS_PER_ROW } from '../shared/consts';
import { CALENDAR_HORIZON_DAYS, DEFAULT_RANGE_DAYS, MAX_RANGE_DAYS, UPCOMING_OCCURRENCE_WINDOW_DAYS } from './consts';
import { InvalidDateRangeError, LessonNotFoundError, LessonOccurrenceNotFoundError } from './errors';
import { addDays, compareIsoDates, daysBetween, todayInIsrael } from './israel-time';
import { selectAreaPreview, selectRabbiUpcoming } from './lesson-rows';
import type {
  AppliedSearchFilters,
  LessonSearchQuery,
  LessonSearchResult,
  OccurrenceQuery,
  ResolvedCalendarOccurrence,
  ResolvedLessonOccurrence,
  ResolvedLessonOccurrenceDetail,
  ResolvedOccurrenceQuery,
} from './models';
import {
  applyException,
  compareOccurrences,
  expandLesson,
  hasLeftPublicListsAt,
  occurrenceTimingAt,
  resolveRecord,
  scheduleOf,
  toExceptionDomain,
  toLessonDomain,
  type Lesson,
  type ResolvedOccurrence,
} from './occurrence';

// Hebrew has no case, but lower-casing also lets a stray Latin fragment (a
// transliterated name) match; a plain substring, never a fuzzy or scored match.
const includesQuery = (value: string, q: string): boolean => value.toLowerCase().includes(q.toLowerCase());

const resolveRange = (query: OccurrenceQuery, now: Date): ResolvedOccurrenceQuery => {
  const today = todayInIsrael(now);
  const from = query.from ?? today;
  const to = query.to ?? addDays(from, DEFAULT_RANGE_DAYS);

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

export interface FoundOccurrences {
  occurrences: ResolvedLessonOccurrence[];
  appliedFilters: AppliedSearchFilters;
}

// Every occurrence the query matches, resolved and sorted, with no paging:
// the one expansion path, shared by the public search (which pages it) and
// the lesson page's rows (which pick from all of it, so a handful of daily
// lessons can never push a later lesson out of a capped row). `now` is read
// once at the edge and threaded through; nothing else here reads the clock.
export const findOccurrences = async (rawQuery: OccurrenceQuery, now: Date): Promise<FoundOccurrences> => {
  const query = resolveRange(rawQuery, now);

  // Rabbis, cities and places are reference tables, loaded whole so that
  // resolving a substitute rabbi or an occurrence's venue never needs a
  // second round trip per occurrence. `places` here is unfiltered by
  // `is_active`: a lesson referencing a deactivated place must still
  // resolve (to its last-known address, via `toVenue`'s own fallback), not
  // throw a data-inconsistency error.
  const [rabbiRows, cityRows, placeRows] = await Promise.all([
    db.select().from(rabbis),
    db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area }).from(cities),
    db.select().from(places),
  ]);

  const rabbiById = new Map(rabbiRows.map((row) => [row.id, toRabbi(row)] as const));
  const cityByCode = new Map(cityRows.map((row) => [row.code, row] as const));
  const placeById = new Map(placeRows.map((row) => [row.id, row] as const));

  // Both maps are already loaded above to resolve every occurrence, so
  // echoing the filter's own display name costs no extra query. `placeById`
  // is unfiltered by `is_active` (see the comment above), so a deactivated
  // place still echoes its last-known name rather than going silent right
  // when the empty result most needs one. Computed before the early return
  // below, since an eliminated area does not itself un-resolve a rabbi or
  // a place filter sent alongside it.
  const appliedRabbi = query.rabbiId ? rabbiById.get(query.rabbiId) : undefined;
  const appliedPlaceRow = query.placeId ? placeById.get(query.placeId) : undefined;
  const appliedFilters = { rabbi: appliedRabbi, place: appliedPlaceRow ? { name: appliedPlaceRow.name } : undefined };

  const eligibleCityCodes =
    query.area !== undefined ? cityRows.filter((row) => row.area === query.area).map((row) => row.code) : undefined;

  if (eligibleCityCodes?.length === 0) {
    return { occurrences: [], appliedFilters };
  }

  // `q` searches the rabbi's name, the lesson's own venue name (its free
  // text, or, for a place-backed lesson, its place's name, resolved from
  // `placeById` already loaded above), and the city's Hebrew name, OR'd
  // together, then combined with every other filter as AND. Rabbis and
  // cities are already loaded whole above, so matching a rabbi or a city
  // happens against those in-memory rows.
  const q = query.q || undefined;
  const matchingRabbiIds = q ? new Set(rabbiRows.filter(rabbiNameMatcher(q, includesQuery)).map((row) => row.id)) : undefined;
  const matchingCityCodes = q ? cityRows.filter((row) => includesQuery(row.nameHe, q)).map((row) => row.code) : undefined;

  // `audience` is applied in memory below, via `matchesAudienceFilter`,
  // because it must OR with `mixed` rather than match exactly.
  const conditions = [
    query.rabbiId ? eq(lessons.rabbiId, query.rabbiId) : undefined,
    query.topic ? eq(lessons.topic, query.topic) : undefined,
    query.city !== undefined ? eq(lessons.cityCode, query.city) : undefined,
    eligibleCityCodes ? inArray(lessons.cityCode, eligibleCityCodes) : undefined,
  ].filter((condition) => condition !== undefined);

  const lessonRows = await db
    .select()
    .from(lessons)
    .where(conditions.length ? and(...conditions) : undefined);

  const matchingRows = q
    ? lessonRows.filter((row) => {
        const placeName = row.placeId !== null ? placeById.get(row.placeId)?.name : undefined;
        return (
          (matchingRabbiIds?.has(row.rabbiId) ?? false) ||
          (row.addressName !== null && includesQuery(row.addressName, q)) ||
          (placeName !== undefined && includesQuery(placeName, q)) ||
          (matchingCityCodes?.includes(row.cityCode) ?? false)
        );
      })
    : lessonRows;

  // Scope and the audience filter both apply here, before expansion, so
  // `total` below is computed over exactly the rows the caller may see.
  // `isLessonInScope`'s name exception does not itself check the audience
  // filter; `matchesAudienceFilter` below is what actually cancels it under
  // a filter, since a rabbanit's lesson is always audience `women`, which
  // neither `men` nor `mixed` passes.
  const scopedRows = matchingRows.filter((row) => {
    const teacherHonorific = rabbiById.get(row.rabbiId)?.honorific;
    if (!teacherHonorific) {
      throw new Error(`data inconsistency: lesson ${row.id} references unknown rabbi ${row.rabbiId}`);
    }

    const teacherNameMatched = matchingRabbiIds?.has(row.rabbiId) ?? false;
    if (!isLessonInScope(query.scope, { audience: row.audience, teacherHonorific }, { teacherNameMatched })) {
      return false;
    }

    return query.audience ? matchesAudienceFilter(query.audience, row.audience) : true;
  });

  const lessonDomainById = new Map(scopedRows.map((row) => [row.id, toLessonDomain(row)] as const));
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

  let occurrences = [...lessonDomainById.values()]
    .flatMap((lesson) => expandLesson(lesson, query.from, query.to))
    .map((raw) => applyException(raw, exceptionByKey.get(`${raw.lesson.id}:${raw.date}`)));

  // `placeId` and `status` both narrow the *resolved* occurrence (after an
  // exception may have moved it away from, or onto, a place, or changed its
  // status), so both sit here: after `applyException`, before `total` is
  // computed, exactly where scope and the audience filter already sit above.
  // Neither special-cases the other, or `search` itself: a caller may set
  // either, both, or neither.
  if (query.placeId !== undefined) {
    occurrences = occurrences.filter((occurrence) => occurrence.venue.kind === 'place' && occurrence.venue.placeId === query.placeId);
  }
  if (query.status !== undefined) {
    occurrences = occurrences.filter((occurrence) => occurrence.status === query.status);
  }

  // A lesson already past its grace period is no longer "coming up". It
  // sits here, after `applyException`, so a moved start time decides, and
  // before `total` so counts and pages stay correct.
  const hasLeftPublicLists = hasLeftPublicListsAt(now);
  occurrences = occurrences.filter((occurrence) => !hasLeftPublicLists(occurrence));

  const sorted = occurrences.sort(compareOccurrences);

  return {
    occurrences: sorted.map((occurrence) => resolveRecord(occurrence, rabbiById, cityByCode, placeById)),
    appliedFilters,
  };
};

export const search = async (query: LessonSearchQuery, now: Date): Promise<LessonSearchResult> => {
  const { occurrences, appliedFilters } = await findOccurrences(query, now);
  const start = (query.page - 1) * query.pageSize;

  return {
    items: occurrences.slice(start, start + query.pageSize),
    page: query.page,
    pageSize: query.pageSize,
    total: occurrences.length,
    appliedFilters,
  };
};

// The lesson page's area row: other lessons in the same `Area` (the region
// enum, never the lesson's own city), soonest first, leaving out every lesson
// of the viewed lesson's rabbi because the rabbi row above already shows them.
// `from`/`to` stay undefined so `resolveRange` applies the default window.
export const searchAreaPreview = async (
  params: { area: Area; excludeRabbiId: string; scope: AudienceScope },
  now: Date,
): Promise<ResolvedLessonOccurrence[]> => {
  const { occurrences } = await findOccurrences({ area: params.area, scope: params.scope }, now);
  return selectAreaPreview(occurrences, params.excludeRabbiId, MAX_ITEMS_PER_ROW);
};

// The lesson page's rabbi row: this rabbi's coming-up lessons across the
// shared two-week window, read under the rabbi's own scope so a rabbanit's
// row is not empty. Keyed by the lesson's own rabbi, so a date taught by a
// substitute stays in the row of the rabbi whose lesson it is.
export const searchRabbiUpcoming = async (
  params: { rabbi: { id: string; honorific: RabbiHonorific }; lessonId: string; date: string },
  now: Date,
): Promise<ResolvedLessonOccurrence[]> => {
  const today = todayInIsrael(now);
  const { occurrences } = await findOccurrences(
    {
      rabbiId: params.rabbi.id,
      scope: audienceScopeOfRabbi(params.rabbi.honorific),
      from: today,
      to: addDays(today, UPCOMING_OCCURRENCE_WINDOW_DAYS - 1),
    },
    now,
  );
  return selectRabbiUpcoming(occurrences, { lessonId: params.lessonId, date: params.date }, MAX_ITEMS_PER_ROW);
};

const calendarHorizonEnd = (today: string): string => addDays(today, CALENDAR_HORIZON_DAYS);

const selectLessonExceptions = (lessonId: string, from: string, to: string) =>
  db
    .select()
    .from(lessonExceptions)
    .where(and(eq(lessonExceptions.lessonId, lessonId), gte(lessonExceptions.date, from), lte(lessonExceptions.date, to)));

// The date a one-off "add to calendar" should add: the viewed occurrence when
// it is scheduled and not yet gone, else, for a weekly lesson, the first
// scheduled and upcoming date after it within the calendar horizon. The
// exceptions of that range are read in one query and the expansion stays in
// memory.
const findCalendarOccurrence = async (lesson: Lesson, viewed: ResolvedOccurrence, now: Date): Promise<ResolvedOccurrence | null> => {
  const timingOf = occurrenceTimingAt(now);
  const isAddable = (occurrence: ResolvedOccurrence): boolean => occurrence.status === 'scheduled' && timingOf(occurrence) === 'upcoming';

  if (isAddable(viewed)) return viewed;
  if (lesson.recurrence.kind === 'once') return null;

  const today = todayInIsrael(now);
  const dayAfterViewed = addDays(viewed.date, 1);
  const from = compareIsoDates(today, dayAfterViewed) >= 0 ? today : dayAfterViewed;
  const to = calendarHorizonEnd(today);
  if (compareIsoDates(from, to) > 0) return null;

  const exceptionRows = await selectLessonExceptions(lesson.id, from, to);
  const exceptionByDate = new Map(exceptionRows.map((row) => [row.date, toExceptionDomain(row)] as const));
  return (
    expandLesson(lesson, from, to)
      .map((raw) => applyException(raw, exceptionByDate.get(raw.date)))
      .find(isAddable) ?? null
  );
};

// The rabbis, cities and places behind a set of occurrences of one lesson,
// in one round of three queries whatever the set's size: the lesson's rabbi
// and every substitute, every venue's city, every registered place.
const loadReferences = async (lesson: Lesson, occurrences: ResolvedOccurrence[]) => {
  const rabbiIds = [...new Set([lesson.rabbiId, ...occurrences.map((occurrence) => occurrence.substituteRabbiId)].filter((id): id is string => id !== undefined))];
  const cityCodes = [...new Set(occurrences.map((occurrence) => occurrence.venue.cityCode))];
  const placeIds = [...new Set(occurrences.flatMap((occurrence) => (occurrence.venue.kind === 'place' ? [occurrence.venue.placeId] : [])))];

  const [rabbiRows, cityRows, placeRows] = await Promise.all([
    db.select().from(rabbis).where(inArray(rabbis.id, rabbiIds)),
    db
      .select({ code: cities.code, nameHe: cities.nameHe, area: cities.area })
      .from(cities)
      .where(inArray(cities.code, cityCodes)),
    placeIds.length ? db.select().from(places).where(inArray(places.id, placeIds)) : Promise.resolve([]),
  ]);

  return {
    rabbiById: new Map(rabbiRows.map((row) => [row.id, toRabbi(row)] as const)),
    cityByCode: new Map(cityRows.map((row) => [row.code, row] as const)),
    placeById: new Map(placeRows.map((row) => [row.id, row] as const)),
  };
};

// Resolves one lesson's recurrence rule for a single date, with any
// exception for that date applied. Reuses `expandLesson`/`applyException`
// so the recurrence rule is only ever expanded in one place; a second
// expansion here would drift from the search route's, exception handling
// most of all.
export const getOccurrence = async (lessonId: string, date: string, now: Date): Promise<ResolvedLessonOccurrenceDetail> => {
  const [lessonRow] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  if (!lessonRow) {
    throw new LessonNotFoundError(lessonId);
  }

  const lesson = toLessonDomain(lessonRow);
  const [raw] = expandLesson(lesson, date, date);
  if (!raw) {
    throw new LessonOccurrenceNotFoundError(lessonId, date);
  }

  const [exceptionRow] = await db
    .select()
    .from(lessonExceptions)
    .where(and(eq(lessonExceptions.lessonId, lessonId), eq(lessonExceptions.date, date)))
    .limit(1);

  const occurrence = applyException(raw, exceptionRow ? toExceptionDomain(exceptionRow) : undefined);
  const calendarOccurrence = await findCalendarOccurrence(lesson, occurrence, now);

  // Both occurrences are resolved from the same lookups, so the query count
  // stays fixed whichever date the calendar one turns out to be.
  const occurrences = calendarOccurrence && calendarOccurrence !== occurrence ? [occurrence, calendarOccurrence] : [occurrence];
  const { rabbiById, cityByCode, placeById } = await loadReferences(lesson, occurrences);

  const resolved = resolveRecord(occurrence, rabbiById, cityByCode, placeById);
  return {
    ...resolved,
    timing: occurrenceTimingAt(now)(occurrence),
    schedule: scheduleOf(lesson),
    calendarOccurrence:
      calendarOccurrence === null ? null : calendarOccurrence === occurrence ? resolved : resolveRecord(calendarOccurrence, rabbiById, cityByCode, placeById),
  };
};

const laterOf = (a: Date, b: Date | undefined): Date => (b !== undefined && b > a ? b : a);

// One lesson's dates from today across the calendar horizon, cancelled ones
// kept (the feed marks them rather than dropping them, so a subscriber's
// calendar learns of the cancellation). Today's date stays even once it has
// begun. A one-time lesson yields at most its own date. An unknown id throws
// `LessonNotFoundError`; the calendar route turns that into an empty feed.
export const getCalendarOccurrences = async (lessonId: string, now: Date): Promise<ResolvedCalendarOccurrence[]> => {
  const today = todayInIsrael(now);
  const to = calendarHorizonEnd(today);

  const [[lessonRow], exceptionRows] = await Promise.all([
    db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1),
    selectLessonExceptions(lessonId, today, to),
  ]);
  if (!lessonRow) {
    throw new LessonNotFoundError(lessonId);
  }

  const lesson = toLessonDomain(lessonRow);
  const exceptionRowByDate = new Map(exceptionRows.map((row) => [row.date, row] as const));
  const occurrences = expandLesson(lesson, today, to).map((raw) => {
    const exceptionRow = exceptionRowByDate.get(raw.date);
    return {
      resolved: applyException(raw, exceptionRow ? toExceptionDomain(exceptionRow) : undefined),
      revisedAt: laterOf(lessonRow.updatedAt, exceptionRow?.updatedAt),
    };
  });
  if (occurrences.length === 0) return [];

  const { rabbiById, cityByCode, placeById } = await loadReferences(
    lesson,
    occurrences.map(({ resolved }) => resolved),
  );

  return occurrences.map(({ resolved, revisedAt }) => ({ ...resolveRecord(resolved, rabbiById, cityByCode, placeById), revisedAt }));
};
