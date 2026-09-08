import type { Area, Lesson, LessonException, LessonPlace, Place, Rabbi, Weekday } from '@torabarabim/common';
import { and, gte, inArray, lte } from 'drizzle-orm';

import { AREAS } from '../../db/schema/enums';
import { db } from '../../db/client';
import { cities, lessonExceptions, lessons, rabbis } from '../../db/schema';
import { applyException, expandLesson, type ResolvedOccurrence } from '../lesson/occurrence';
import { addDays, compareIsoDates, todayInIsrael } from '../lesson/israel-time';
import { AREA_NAMES_HE, HOME_WINDOW_DAYS, MAX_ITEMS_PER_ROW, MIN_ITEMS_PER_ROW, PROMINENCE_RANK } from './consts';
import type { HomeResult, HomeRowResult, ResolvedHomeOccurrence } from './models';

const MINUTES_PER_DAY = 24 * 60;

const addMinutes = (startTime: string, minutes: number): string => {
  const [hoursText, minutesText] = startTime.split(':');
  const total = Number(hoursText) * 60 + Number(minutesText) + minutes;
  const wrapped = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

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

type LessonRow = typeof lessons.$inferSelect;
type ExceptionRow = typeof lessonExceptions.$inferSelect;
type RabbiRow = typeof rabbis.$inferSelect;
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

const toRabbi = (row: RabbiRow): Rabbi => ({
  id: row.id,
  name: row.name,
  title: row.title ?? undefined,
  photoUrl: row.photoUrl ?? undefined,
  bio: row.bio ?? undefined,
});

const resolveRecord = (
  occurrence: ResolvedOccurrence,
  rabbiRowById: Map<string, RabbiRow>,
  cityByCode: Map<number, CityRow>,
): ResolvedHomeOccurrence => {
  const rabbiRow = rabbiRowById.get(occurrence.lesson.rabbiId);
  if (!rabbiRow) {
    throw new Error(`data inconsistency: lesson ${occurrence.lesson.id} references unknown rabbi ${occurrence.lesson.rabbiId}`);
  }

  const substituteRabbiRow = occurrence.substituteRabbiId ? rabbiRowById.get(occurrence.substituteRabbiId) : undefined;
  // The substitute is who is actually teaching, so their tier, not the
  // lesson's own rabbi's, decides where this occurrence sorts.
  const activeProminence = substituteRabbiRow?.prominence ?? rabbiRow.prominence;

  return {
    lessonId: occurrence.lesson.id,
    date: occurrence.date,
    startTime: occurrence.startTime,
    endTime: addMinutes(occurrence.startTime, occurrence.lesson.durationMinutes),
    title: occurrence.lesson.title,
    topic: occurrence.lesson.topic,
    audience: occurrence.lesson.audience,
    recurrenceKind: occurrence.lesson.recurrence.kind,
    rabbi: toRabbi(rabbiRow),
    place: toPlace(occurrence.place, cityByCode),
    substituteRabbi: substituteRabbiRow ? toRabbi(substituteRabbiRow) : undefined,
    note: occurrence.note,
    rabbiProminenceRank: PROMINENCE_RANK[activeProminence],
    shuffleKey: hashLessonId(occurrence.lesson.id),
  };
};

const pickNearestPerLesson = (occurrences: ResolvedHomeOccurrence[]): ResolvedHomeOccurrence[] => {
  const nearestByLessonId = new Map<string, ResolvedHomeOccurrence>();
  for (const occurrence of occurrences) {
    const existing = nearestByLessonId.get(occurrence.lessonId);
    if (!existing || compareIsoDates(occurrence.date, existing.date) < 0) {
      nearestByLessonId.set(occurrence.lessonId, occurrence);
    }
  }
  return [...nearestByLessonId.values()];
};

const orderRow = (occurrences: ResolvedHomeOccurrence[]): ResolvedHomeOccurrence[] =>
  [...occurrences].sort((a, b) => {
    const byProminence = a.rabbiProminenceRank - b.rabbiProminenceRank;
    if (byProminence !== 0) return byProminence;
    return a.shuffleKey - b.shuffleKey;
  });

const buildRow = (
  id: HomeRowResult['id'],
  title: string,
  matches: ResolvedHomeOccurrence[],
): HomeRowResult | undefined => {
  const items = orderRow(pickNearestPerLesson(matches)).slice(0, MAX_ITEMS_PER_ROW);
  return items.length >= MIN_ITEMS_PER_ROW ? { id, title, items } : undefined;
};

// The four rows filter on different, overlapping axes (area, day, audience,
// recurrence), so the same lesson easily qualifies for two or three of
// them. A lesson already shown in an earlier row is excluded from every
// later one, so a reader scrolling down never sees the same card twice; a
// row that drops below MIN_ITEMS_PER_ROW after that exclusion is dropped
// entirely by `buildRow`, never sent half-empty.
const buildRowExcluding = (
  usedLessonIds: Set<string>,
  id: HomeRowResult['id'],
  title: string,
  matches: ResolvedHomeOccurrence[],
): HomeRowResult | undefined => {
  const eligible = matches.filter((occurrence) => !usedLessonIds.has(occurrence.lessonId));
  const row = buildRow(id, title, eligible);
  row?.items.forEach((item) => usedLessonIds.add(item.lessonId));
  return row;
};

// Iterates `AREAS` in its declared order and only replaces on a strictly
// greater count, so a tie deterministically picks the earlier area.
const chooseArea = (occurrences: ResolvedHomeOccurrence[]): Area | undefined => {
  const countByArea = new Map<Area, number>();
  for (const occurrence of occurrences) {
    countByArea.set(occurrence.place.area, (countByArea.get(occurrence.place.area) ?? 0) + 1);
  }

  let chosen: Area | undefined;
  let bestCount = 0;
  for (const area of AREAS) {
    const count = countByArea.get(area) ?? 0;
    if (count > bestCount) {
      bestCount = count;
      chosen = area;
    }
  }
  return chosen;
};

// `now` is read once here, at the edge, and threaded through; nothing else
// in this module reads the clock directly.
export const getHome = async (now: Date): Promise<HomeResult> => {
  const from = todayInIsrael(now);
  // `expandLesson` treats `to` as inclusive, so the last day of the window
  // is `HOME_WINDOW_DAYS - 1` days after today for a window that counts today.
  const to = addDays(from, HOME_WINDOW_DAYS - 1);

  const [rabbiRows, cityRows, lessonRows] = await Promise.all([
    db.select().from(rabbis),
    db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area }).from(cities),
    db.select().from(lessons),
  ]);

  const rabbiRowById = new Map(rabbiRows.map((row) => [row.id, row] as const));
  const cityByCode = new Map(cityRows.map((row) => [row.code, row] as const));

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
  const resolved = [...lessonDomainById.values()]
    .flatMap((lesson) => expandLesson(lesson, from, to))
    .map((raw) => applyException(raw, exceptionByKey.get(`${raw.lesson.id}:${raw.date}`)))
    .filter((occurrence) => occurrence.status === 'scheduled')
    .map((occurrence) => resolveRecord(occurrence, rabbiRowById, cityByCode));

  const area = chooseArea(resolved);
  const today = from;
  const usedLessonIds = new Set<string>();

  const rows = [
    area
      ? buildRowExcluding(
          usedLessonIds,
          'area',
          `שיעורים באזור ${AREA_NAMES_HE[area]}`,
          resolved.filter((o) => o.place.area === area),
        )
      : undefined,
    buildRowExcluding(usedLessonIds, 'today', 'שיעורים היום', resolved.filter((o) => o.date === today)),
    buildRowExcluding(
      usedLessonIds,
      'bothAudiences',
      'שיעורים לגברים ולנשים',
      resolved.filter((o) => o.audience === 'mixed'),
    ),
    buildRowExcluding(
      usedLessonIds,
      'weekly',
      'שיעורים קבועים כל שבוע',
      resolved.filter((o) => o.recurrenceKind === 'weekly'),
    ),
  ].filter((row): row is HomeRowResult => row !== undefined);

  return { rows };
};
