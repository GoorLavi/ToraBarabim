import type { Area, Lesson, LessonException, LessonPlace, LessonOccurrence as WireLessonOccurrence, Place, Rabbi, Weekday } from '@torabarabim/common';
import { and, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { cities, lessonExceptions, lessons, rabbis } from '../../db/schema';
import { addDays, todayInIsrael } from '../lesson/israel-time';
import { applyException, expandLesson, type ResolvedOccurrence } from '../lesson/occurrence';
import { UPCOMING_OCCURRENCE_WINDOW_DAYS } from './consts';
import { LessonNotFoundError, UnknownCityError } from './errors';
import type { CreateRabbiLessonInput, RabbiLessonListQuery, RabbiLessonListResult, RabbiLessonRecord, UpdateRabbiLessonInput } from './models';

const lessonSelection = {
  id: lessons.id,
  title: lessons.title,
  rabbiId: lessons.rabbiId,
  placeName: lessons.placeName,
  placeStreet: lessons.placeStreet,
  placeFloor: lessons.placeFloor,
  cityCode: lessons.cityCode,
  cityName: cities.nameHe,
  topic: lessons.topic,
  audience: lessons.audience,
  recurrenceKind: lessons.recurrenceKind,
  recurrenceWeekdays: lessons.recurrenceWeekdays,
  recurrenceDate: lessons.recurrenceDate,
  startTime: lessons.startTime,
  durationMinutes: lessons.durationMinutes,
  notes: lessons.notes,
  updatedAt: lessons.updatedAt,
};

const baseLessonQuery = () => db.select(lessonSelection).from(lessons).innerJoin(cities, eq(lessons.cityCode, cities.code));

type JoinedLessonRow = Awaited<ReturnType<typeof baseLessonQuery>>[number];

const toRecord = (row: JoinedLessonRow): RabbiLessonRecord => ({
  id: row.id,
  title: row.title ?? undefined,
  rabbiId: row.rabbiId,
  place: {
    name: row.placeName,
    street: row.placeStreet,
    floor: row.placeFloor ?? undefined,
    cityCode: row.cityCode,
    cityName: row.cityName,
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

const verifyCity = async (cityCode: number): Promise<void> => {
  const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.code, cityCode)).limit(1);
  if (!rows[0]) throw new UnknownCityError(cityCode);
};

export const list = async (rabbiId: string, query: RabbiLessonListQuery): Promise<RabbiLessonListResult> => {
  const whereClause = eq(lessons.rabbiId, rabbiId);

  const [rows, totalRows] = await Promise.all([
    baseLessonQuery()
      .where(whereClause)
      .orderBy(desc(lessons.updatedAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(lessons).where(whereClause),
  ]);

  return { items: rows.map(toRecord), page: query.page, pageSize: query.pageSize, total: totalRows[0]?.count ?? 0 };
};

export const getOwnById = async (rabbiId: string, id: string): Promise<RabbiLessonRecord> => {
  const rows = await baseLessonQuery().where(and(eq(lessons.id, id), eq(lessons.rabbiId, rabbiId))).limit(1);
  const row = rows[0];
  if (!row) throw new LessonNotFoundError(id);
  return toRecord(row);
};

export const create = async (rabbiId: string, input: CreateRabbiLessonInput): Promise<RabbiLessonRecord> => {
  await verifyCity(input.place.cityCode);

  const [row] = await db
    .insert(lessons)
    .values({
      id: nanoid(),
      title: input.title,
      rabbiId,
      placeName: input.place.name,
      placeStreet: input.place.street,
      placeFloor: input.place.floor,
      cityCode: input.place.cityCode,
      topic: input.topic,
      audience: input.audience,
      recurrenceKind: input.recurrence.kind,
      recurrenceWeekdays: input.recurrence.kind === 'weekly' ? input.recurrence.weekdays : null,
      recurrenceDate: input.recurrence.kind === 'once' ? input.recurrence.date : null,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
      notes: input.notes,
    })
    .returning({ id: lessons.id });
  if (!row) throw new Error('insert into lessons returned no row');
  return getOwnById(rabbiId, row.id);
};

export const update = async (rabbiId: string, id: string, input: UpdateRabbiLessonInput): Promise<RabbiLessonRecord> => {
  await verifyCity(input.place.cityCode);

  const [row] = await db
    .update(lessons)
    .set({
      // `?? null` on every optional field: this is a full-replacement
      // update, so an omitted field must clear the column, not leave a
      // stale value in place. Drizzle skips a column entirely when its
      // `.set()` value is `undefined`, which would otherwise silently
      // keep whatever was there before.
      title: input.title ?? null,
      placeName: input.place.name,
      placeStreet: input.place.street,
      placeFloor: input.place.floor ?? null,
      cityCode: input.place.cityCode,
      topic: input.topic,
      audience: input.audience,
      recurrenceKind: input.recurrence.kind,
      recurrenceWeekdays: input.recurrence.kind === 'weekly' ? input.recurrence.weekdays : null,
      recurrenceDate: input.recurrence.kind === 'once' ? input.recurrence.date : null,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
      notes: input.notes ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(lessons.id, id), eq(lessons.rabbiId, rabbiId)))
    .returning({ id: lessons.id });
  if (!row) throw new LessonNotFoundError(id);
  return getOwnById(rabbiId, row.id);
};

// Deleting a lesson deletes its own exceptions in the same transaction,
// matching the admin delete: the exceptions are part of the lesson, not a
// separate thing the rabbi might not expect to lose.
export const remove = async (rabbiId: string, id: string): Promise<void> => {
  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: lessons.id })
      .from(lessons)
      .where(and(eq(lessons.id, id), eq(lessons.rabbiId, rabbiId)))
      .limit(1);
    if (!rows[0]) throw new LessonNotFoundError(id);

    await tx.delete(lessonExceptions).where(eq(lessonExceptions.lessonId, id));
    await tx.delete(lessons).where(eq(lessons.id, id));
  });
};

type LessonRow = typeof lessons.$inferSelect;
type ExceptionRow = typeof lessonExceptions.$inferSelect;
type RabbiRow = typeof rabbis.$inferSelect;
type CityRow = { code: number; nameHe: string; area: Area };

const toLessonDomain = (row: LessonRow): Lesson => ({
  id: row.id,
  title: row.title ?? undefined,
  rabbiId: row.rabbiId,
  place: { name: row.placeName, street: row.placeStreet, floor: row.placeFloor ?? undefined, cityCode: row.cityCode },
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

const toPlace = (place: LessonPlace, cityByCode: Map<number, CityRow>): Place => {
  const city = cityByCode.get(place.cityCode);
  if (!city) throw new Error(`data inconsistency: a lesson references unknown city code ${place.cityCode}`);
  return { name: place.name, street: place.street, floor: place.floor, city: city.nameHe, area: city.area };
};

const toRabbi = (row: RabbiRow): Rabbi => ({
  id: row.id,
  name: row.name,
  title: row.title ?? undefined,
  photoUrl: row.photoUrl ?? undefined,
  bio: row.bio ?? undefined,
});

const MINUTES_PER_DAY = 24 * 60;
const addMinutes = (startTime: string, minutes: number): string => {
  const [hoursText, minutesText] = startTime.split(':');
  const total = Number(hoursText) * 60 + Number(minutesText) + minutes;
  const wrapped = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const STATUS_ORDER = { scheduled: 0, cancelled: 1 } as const;
const compareOccurrences = (a: ResolvedOccurrence, b: ResolvedOccurrence): number => {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  if (byStatus !== 0) return byStatus;
  return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0;
};

// Reuses the same recurrence-expansion primitives (`expandLesson`,
// `applyException`) as the public search and the home page, rather than a
// second copy of the recurrence maths, per the house rule on the
// recurrence expansion.
export const listUpcomingOccurrences = async (rabbiId: string, now: Date): Promise<WireLessonOccurrence[]> => {
  const from = todayInIsrael(now);
  // `expandLesson` treats `to` as inclusive, so the last day of the window
  // is `UPCOMING_OCCURRENCE_WINDOW_DAYS - 1` days after today for a window
  // that counts today, matching `home.ts`'s `HOME_WINDOW_DAYS` convention.
  const to = addDays(from, UPCOMING_OCCURRENCE_WINDOW_DAYS - 1);

  const [rabbiRows, cityRows, lessonRows] = await Promise.all([
    db.select().from(rabbis),
    db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area }).from(cities),
    db.select().from(lessons).where(eq(lessons.rabbiId, rabbiId)),
  ]);

  const rabbiById = new Map(rabbiRows.map((row) => [row.id, row] as const));
  const cityByCode = new Map(cityRows.map((row) => [row.code, row] as const));
  const own = rabbiById.get(rabbiId);
  if (!own) throw new Error(`data inconsistency: authenticated rabbi '${rabbiId}' has no rabbi row`);

  const lessonIds = lessonRows.map((row) => row.id);
  const exceptionRows = lessonIds.length
    ? await db
        .select()
        .from(lessonExceptions)
        .where(and(inArray(lessonExceptions.lessonId, lessonIds), gte(lessonExceptions.date, from), lte(lessonExceptions.date, to)))
    : [];
  const exceptionByKey = new Map(exceptionRows.map((row) => [`${row.lessonId}:${row.date}`, toExceptionDomain(row)] as const));

  const occurrences = lessonRows
    .map(toLessonDomain)
    .flatMap((lesson) => expandLesson(lesson, from, to))
    .map((raw) => applyException(raw, exceptionByKey.get(`${raw.lesson.id}:${raw.date}`)))
    .sort(compareOccurrences);

  return occurrences.map((occurrence) => {
    const substituteRabbiRow = occurrence.substituteRabbiId ? rabbiById.get(occurrence.substituteRabbiId) : undefined;
    return {
      lessonId: occurrence.lesson.id,
      date: occurrence.date,
      startTime: occurrence.startTime,
      endTime: addMinutes(occurrence.startTime, occurrence.lesson.durationMinutes),
      status: occurrence.status,
      title: occurrence.lesson.title,
      topic: occurrence.lesson.topic,
      audience: occurrence.lesson.audience,
      rabbi: toRabbi(own),
      place: toPlace(occurrence.place, cityByCode),
      substituteRabbi: substituteRabbiRow ? toRabbi(substituteRabbiRow) : undefined,
      cancellationReason: occurrence.cancellationReason,
      note: occurrence.note,
    };
  });
};
