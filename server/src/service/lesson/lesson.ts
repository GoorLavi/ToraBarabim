import type { Area, AudienceScope } from '@torabarabim/common';
import { and, eq, gte, inArray, lte } from 'drizzle-orm';

import { db } from '../../db/client';
import { cities, lessonExceptions, lessons, places, rabbis } from '../../db/schema';
import { isLessonInScope, matchesAudienceFilter } from '../shared/audience-scope';
import { toRabbiSummary as toRabbi } from '../shared/rabbi-summary';
import { DEFAULT_PAGE } from '../shared/consts';
import { selectAreaPreview } from './area-preview';
import { AREA_PREVIEW_FETCH_SIZE, AREA_PREVIEW_LIMIT, DEFAULT_RANGE_DAYS, MAX_RANGE_DAYS } from './consts';
import { InvalidDateRangeError, LessonNotFoundError, LessonOccurrenceNotFoundError } from './errors';
import { addDays, compareIsoDates, daysBetween, todayInIsrael } from './israel-time';
import type { LessonSearchQuery, LessonSearchResult, ResolvedLessonOccurrence, ResolvedLessonSearchQuery } from './models';
import { applyException, compareOccurrences, expandLesson, resolveRecord, toExceptionDomain, toLessonDomain } from './occurrence';

// Hebrew has no case, but lower-casing also lets a stray Latin fragment (a
// transliterated name) match; a plain substring, never a fuzzy or scored match.
const includesQuery = (value: string, q: string): boolean => value.toLowerCase().includes(q.toLowerCase());

const resolveRange = (query: LessonSearchQuery, now: Date): ResolvedLessonSearchQuery => {
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

// `now` is read once here, at the edge, and threaded through; nothing else
// in this module reads the clock directly.
export const search = async (rawQuery: LessonSearchQuery, now: Date): Promise<LessonSearchResult> => {
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

  const eligibleCityCodes =
    query.area !== undefined ? cityRows.filter((row) => row.area === query.area).map((row) => row.code) : undefined;

  if (eligibleCityCodes?.length === 0) {
    return { items: [], page: query.page, pageSize: query.pageSize, total: 0 };
  }

  // `q` searches the rabbi's name, the lesson's own free-text venue name
  // (a place-backed lesson has no address text of its own to match: see
  // the follow-up noted in the wave's report), and the city's Hebrew name,
  // OR'd together, then combined with every other filter as AND. Rabbis and
  // cities are already loaded whole above, so matching a rabbi or a city
  // happens against those in-memory rows.
  const q = query.q || undefined;
  const matchingRabbiIds = q ? new Set(rabbiRows.filter((row) => includesQuery(row.name, q)).map((row) => row.id)) : undefined;
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
    ? lessonRows.filter(
        (row) =>
          (matchingRabbiIds?.has(row.rabbiId) ?? false) ||
          (row.addressName !== null && includesQuery(row.addressName, q)) ||
          (matchingCityCodes?.includes(row.cityCode) ?? false),
      )
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

  occurrences = occurrences.sort(compareOccurrences);

  const total = occurrences.length;
  const start = (query.page - 1) * query.pageSize;
  const items = occurrences
    .slice(start, start + query.pageSize)
    .map((occurrence) => resolveRecord(occurrence, rabbiById, cityByCode, placeById));

  return { items, page: query.page, pageSize: query.pageSize, total };
};

// The lesson page's area preview: other lessons in the same `Area` (the
// region enum, never the lesson's own city), soonest first, excluding the
// lesson the reader is already on. Builds a complete `LessonSearchQuery`
// itself, leaving `from`/`to` undefined so `resolveRange` applies the
// default window that `AREA_PREVIEW_FETCH_SIZE` is sized against.
export const searchAreaPreview = async (
  params: { area: Area; excludeLessonId: string; scope: AudienceScope },
  now: Date,
): Promise<ResolvedLessonOccurrence[]> => {
  const query: LessonSearchQuery = {
    area: params.area,
    scope: params.scope,
    page: DEFAULT_PAGE,
    pageSize: AREA_PREVIEW_FETCH_SIZE,
  };

  const result = await search(query, now);
  return selectAreaPreview(result.items, params.excludeLessonId, AREA_PREVIEW_LIMIT);
};

// Resolves one lesson's recurrence rule for a single date, with any
// exception for that date applied. Reuses `expandLesson`/`applyException`
// so the recurrence rule is only ever expanded in one place; a second
// expansion here would drift from the search route's, exception handling
// most of all.
export const getOccurrence = async (lessonId: string, date: string): Promise<ResolvedLessonOccurrence> => {
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

  const rabbiIds = [lesson.rabbiId, occurrence.substituteRabbiId].filter(
    (id): id is string => id !== undefined,
  );

  const [rabbiRows, cityRows, placeRows] = await Promise.all([
    db.select().from(rabbis).where(inArray(rabbis.id, rabbiIds)),
    db
      .select({ code: cities.code, nameHe: cities.nameHe, area: cities.area })
      .from(cities)
      .where(eq(cities.code, occurrence.venue.cityCode)),
    occurrence.venue.kind === 'place' ? db.select().from(places).where(eq(places.id, occurrence.venue.placeId)) : Promise.resolve([]),
  ]);

  const rabbiById = new Map(rabbiRows.map((row) => [row.id, toRabbi(row)] as const));
  const cityByCode = new Map(cityRows.map((row) => [row.code, row] as const));
  const placeById = new Map(placeRows.map((row) => [row.id, row] as const));

  return resolveRecord(occurrence, rabbiById, cityByCode, placeById);
};
