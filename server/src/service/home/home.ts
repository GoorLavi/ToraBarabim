import type { Area, HomeTopic, LessonTopic, Rabbi } from '@torabarabim/common';
import { and, gte, inArray, lte } from 'drizzle-orm';

import { AREAS, LESSON_TOPICS } from '../../db/schema/enums';
import { db } from '../../db/client';
import { cities, lessonExceptions, lessons, places, rabbis } from '../../db/schema';
import * as courseService from '../course/course';
import * as dedicationService from '../dedication/dedication';
import { applyException, expandLesson, hasLeftPublicListsAt, resolveRecord, toExceptionDomain, toLessonDomain, type ResolvedOccurrence } from '../lesson/occurrence';
import { addDays, todayInIsrael } from '../lesson/israel-time';
import { isLessonInScope, isRabbiInDirectoryScope } from '../shared/audience-scope';
import { AREA_NAMES_HE } from '../shared/consts';
import type { AddressCityRow, AddressPlaceRow } from '../shared/address';
import { compareRabbiOrder, PROMINENCE_RANK } from '../shared/rabbi-order';
import { toRabbiSummary as toRabbi } from '../shared/rabbi-summary';
import {
  BOTH_AUDIENCES_ROW_TITLE,
  HOME_RABBI_ROW_CAP,
  HOME_WINDOW_DAYS,
  MAX_AREA_ROWS,
  MIDDAY_ROW_TITLE,
  MORNING_ROW_TITLE,
  TODAY_ROW_TITLE,
  TOPIC_ROW_TITLES,
  WEEKLY_ROW_TITLE,
} from './consts';
import {
  buildRow,
  countLessonsByCity,
  countOccurrencesByCity,
  hebrewCollator,
  interleaveRows,
  placeCourseRow,
  placeHelpTiles,
  placeWomensAreaTile,
  rankCitiesForGrid,
  timeBandOf,
} from './home-rows';
import type { HomeResult, HomeRowResult, LessonHomeRowResult, LoadedWindow, ResolvedHomeOccurrence, WomenAreaResult, WomensSet } from './models';

// A small deterministic hash of the lesson id, used only as a stable
// secondary sort key within a prominence tier: it must not depend on the
// clock or `Math.random()`, so the order is reproducible across requests.
const hashLessonId = (id: string): number => {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return hash;
};

type RabbiRow = typeof rabbis.$inferSelect;

// Wraps the shared `resolveRecord` (`service/lesson/occurrence.ts`): every
// field the wire `LessonOccurrence` carries, plus the sort-only fields a
// home row needs. Reusing it, rather than a second hand-rolled resolver, is
// exactly what the house rule on the recurrence expansion asks for: this
// module used to carry its own copy of `toLessonDomain`/`toExceptionDomain`/
// `resolveRecord`, which would otherwise silently drift from the search's.
const resolveHomeRecord = (
  occurrence: ResolvedOccurrence,
  rabbiRowById: Map<string, RabbiRow>,
  rabbiById: Map<string, Rabbi>,
  cityByCode: Map<number, AddressCityRow>,
  placeById: Map<string, AddressPlaceRow>,
): ResolvedHomeOccurrence => {
  const rabbiRow = rabbiRowById.get(occurrence.lesson.rabbiId);
  if (!rabbiRow) {
    throw new Error(`data inconsistency: lesson ${occurrence.lesson.id} references unknown rabbi ${occurrence.lesson.rabbiId}`);
  }

  const substituteRabbiRow = occurrence.substituteRabbiId ? rabbiRowById.get(occurrence.substituteRabbiId) : undefined;
  // The substitute is who is actually teaching, so their tier, not the
  // lesson's own rabbi's, decides where this occurrence sorts. This is a
  // sort-only concern; scope (below) always reads the lesson's own rabbi.
  const activeProminence = substituteRabbiRow?.prominence ?? rabbiRow.prominence;

  const resolved = resolveRecord(occurrence, rabbiById, cityByCode, placeById);

  return {
    ...resolved,
    recurrenceKind: occurrence.lesson.recurrence.kind,
    // The lesson's own city, not `occurrence.venue`'s (an exception may
    // move a single date to a different venue): the women's-area city list
    // must stay tappable through `/v1/lessons?city=`, which filters on the
    // lesson's own `cityCode`, not a one-off exception's.
    cityCode: occurrence.lesson.venue.cityCode,
    rabbiProminenceRank: PROMINENCE_RANK[activeProminence],
    shuffleKey: hashLessonId(occurrence.lesson.id),
  };
};

const countByKey = <Key>(occurrences: ResolvedHomeOccurrence[], keyOf: (occurrence: ResolvedHomeOccurrence) => Key | undefined): Map<Key, number> => {
  const counts = new Map<Key, number>();
  for (const occurrence of occurrences) {
    const key = keyOf(occurrence);
    if (key !== undefined) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
};

// Highest raw occurrence count first. `candidates` is in its declared order
// and the sort is stable, so a tie keeps the earlier candidate.
const rankByCount = <Key>(candidates: readonly Key[], counts: Map<Key, number>): Key[] =>
  candidates.filter((key) => (counts.get(key) ?? 0) > 0).sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));

const isHomeTopic = (topic: LessonTopic): topic is HomeTopic => topic !== 'other';
const HOME_TOPICS: readonly HomeTopic[] = LESSON_TOPICS.filter(isHomeTopic);

const buildFixedRows = (resolved: ResolvedHomeOccurrence[], today: string): LessonHomeRowResult[] =>
  [
    buildRow('today', TODAY_ROW_TITLE, resolved.filter((o) => o.date === today)),
    buildRow('bothAudiences', BOTH_AUDIENCES_ROW_TITLE, resolved.filter((o) => o.audience === 'mixed')),
    buildRow('weekly', WEEKLY_ROW_TITLE, resolved.filter((o) => o.recurrenceKind === 'weekly')),
    buildRow('morning', MORNING_ROW_TITLE, resolved.filter((o) => timeBandOf(o.startTime) === 'morning')),
    buildRow('midday', MIDDAY_ROW_TITLE, resolved.filter((o) => timeBandOf(o.startTime) === 'midday')),
  ].filter((row): row is LessonHomeRowResult => row !== undefined);

// An area ranked high by raw count can still drop below the minimum after the
// per-rabbi cap, so rows are built first and the limit is applied to the
// survivors.
const buildAreaRows = (resolved: ResolvedHomeOccurrence[]): LessonHomeRowResult[] =>
  rankByCount<Area>(AREAS, countByKey(resolved, (o) => o.venue.area))
    .map((area) => buildRow(`area:${area}`, `שיעורים באזור ${AREA_NAMES_HE[area]}`, resolved.filter((o) => o.venue.area === area)))
    .filter((row): row is LessonHomeRowResult => row !== undefined)
    .slice(0, MAX_AREA_ROWS);

const buildTopicRows = (resolved: ResolvedHomeOccurrence[]): LessonHomeRowResult[] =>
  rankByCount<HomeTopic>(HOME_TOPICS, countByKey<HomeTopic>(resolved, (o) => (o.topic && isHomeTopic(o.topic) ? o.topic : undefined)))
    .map((topic) => buildRow(`topic:${topic}`, TOPIC_ROW_TITLES[topic], resolved.filter((o) => o.topic === topic)))
    .filter((row): row is LessonHomeRowResult => row !== undefined);

// `lessonCount` matches the rest of the site's "{n} שיעורים בשבועיים
// הקרובים" copy: occurrences in the 14-day window, not distinct lessons. A
// lesson recurring three times in the window counts three times here, and
// `resolved` (from `loadWindow`) already excludes cancelled occurrences.
const buildWomensSet = (resolved: ResolvedHomeOccurrence[], cityByCode: Map<number, AddressCityRow>): WomensSet => {
  const inScope = resolved.filter((occurrence) =>
    isLessonInScope('women', { audience: occurrence.audience, teacherHonorific: occurrence.rabbi.honorific }),
  );

  const teacherById = new Map(inScope.map((occurrence) => [occurrence.rabbi.id, occurrence.rabbi] as const));

  const citiesWithLessonCount = countOccurrencesByCity(inScope, cityByCode);

  return {
    lessonCount: inScope.length,
    teachers: [...teacherById.values()].sort((a, b) => hebrewCollator.compare(a.name, b.name)),
    // Alphabetical, matching the city directory and area page's own
    // ordering of `CityWithLessonCount` (`service/city/city.ts`).
    cities: citiesWithLessonCount.sort((a, b) => hebrewCollator.compare(a.name, b.name)),
  };
};

// `now` is read once here, at the edge, and threaded through; nothing else
// in this module reads the clock directly.
const loadWindow = async (now: Date): Promise<LoadedWindow> => {
  const from = todayInIsrael(now);
  // `expandLesson` treats `to` as inclusive, so the last day of the window
  // is `HOME_WINDOW_DAYS - 1` days after today for a window that counts today.
  const to = addDays(from, HOME_WINDOW_DAYS - 1);

  const [rabbiRows, cityRows, placeRows, lessonRows] = await Promise.all([
    db.select().from(rabbis),
    db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area }).from(cities),
    db.select().from(places),
    db.select().from(lessons),
  ]);

  const rabbiRowById = new Map(rabbiRows.map((row) => [row.id, row] as const));
  const rabbiById = new Map(rabbiRows.map((row) => [row.id, toRabbi(row)] as const));
  const cityByCode = new Map(cityRows.map((row) => [row.code, row] as const));
  const placeById = new Map(placeRows.map((row) => [row.id, row] as const));
  const rabbiIdsWithLessons = new Set(lessonRows.map((row) => row.rabbiId));

  const lessonDomainById = new Map(lessonRows.map((row) => [row.id, toLessonDomain(row)] as const));
  const lessonIds = [...lessonDomainById.keys()];

  const exceptionRows = lessonIds.length
    ? await db
        .select()
        .from(lessonExceptions)
        .where(and(inArray(lessonExceptions.lessonId, lessonIds), gte(lessonExceptions.date, from), lte(lessonExceptions.date, to)))
    : [];

  const exceptionByKey = new Map(exceptionRows.map((row) => [`${row.lessonId}:${row.date}`, toExceptionDomain(row)] as const));

  // Cancelled occurrences are dropped here, unlike `GET /v1/lessons`: a
  // home rail is a browse surface answering "what is on", not a schedule,
  // so there is nothing useful to show for a lesson that will not happen.
  const hasLeftPublicLists = hasLeftPublicListsAt(now);
  const resolved = [...lessonDomainById.values()]
    .flatMap((lesson) => expandLesson(lesson, from, to))
    .map((raw) => applyException(raw, exceptionByKey.get(`${raw.lesson.id}:${raw.date}`)))
    .filter((occurrence) => occurrence.status === 'scheduled')
    .filter((occurrence) => !hasLeftPublicLists(occurrence))
    .map((occurrence) => resolveHomeRecord(occurrence, rabbiRowById, rabbiById, cityByCode, placeById));

  return { from, resolved, cityByCode, rabbiRows, rabbiIdsWithLessons };
};

export const getHome = async (now: Date, random: () => number = Math.random): Promise<HomeResult> => {
  // Independent of each other, so they run together rather than adding a
  // second sequential round trip to the response.
  const [{ from: today, resolved: allResolved, cityByCode, rabbiRows, rabbiIdsWithLessons }, dedicationGroups, courseItems] = await Promise.all([
    loadWindow(now),
    dedicationService.listActive(now),
    courseService.listForHomeRow(now),
  ]);

  // The "לפי רב" avatar row: every rabbi in the general directory scope
  // (0026: a rabbanit stays off this general surface, exactly as she does
  // off the rows below), ordered by the shared tier/has-lessons/name/id
  // rule and capped for the row's measured width.
  const homeRabbis = [...rabbiRows]
    .filter((row) => isRabbiInDirectoryScope('general', row.honorific))
    .sort((a, b) =>
      compareRabbiOrder(
        { id: a.id, name: a.name, prominence: a.prominence, hasLessons: rabbiIdsWithLessons.has(a.id) },
        { id: b.id, name: b.name, prominence: b.prominence, hasLessons: rabbiIdsWithLessons.has(b.id) },
      ),
    )
    .slice(0, HOME_RABBI_ROW_CAP);

  const { lessonCount: womensAreaLessonCount } = buildWomensSet(allResolved, cityByCode);

  // 0026: a rabbanit's lesson leaves the general surfaces, so the rows
  // below are built from the general-scope set, not every occurrence.
  const resolved = allResolved.filter((occurrence) =>
    isLessonInScope('general', { audience: occurrence.audience, teacherHonorific: occurrence.rabbi.honorific }),
  );

  const interleaved = interleaveRows({
    fixed: buildFixedRows(resolved, today),
    areas: buildAreaRows(resolved),
    topics: buildTopicRows(resolved),
  });
  const lessonRows = womensAreaLessonCount > 0 ? placeWomensAreaTile(interleaved) : interleaved;

  const rows: HomeRowResult[] = placeCourseRow(placeHelpTiles(lessonRows, random), courseItems);
  const cities = rankCitiesForGrid(countLessonsByCity(resolved, cityByCode));

  return { rows, womensAreaLessonCount, rabbis: homeRabbis, dedicationGroups, cities };
};

export const getWomenArea = async (now: Date): Promise<WomenAreaResult> => {
  const [{ resolved, cityByCode, rabbiRows }, courses] = await Promise.all([loadWindow(now), courseService.listForWomenArea(now)]);
  const { lessonCount, teachers, cities: womenCities } = buildWomensSet(resolved, cityByCode);

  if (lessonCount === 0) {
    const rabbaniyot = rabbiRows
      .filter((row) => isRabbiInDirectoryScope('women', row.honorific))
      .map((row) => toRabbi(row))
      .sort((a, b) => hebrewCollator.compare(a.name, b.name));
    return { kind: 'empty', rabbaniyot, courses };
  }

  return { kind: 'populated', lessonCount, teachers, cities: womenCities, courses };
};
