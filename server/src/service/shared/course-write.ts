import type { CloseReason, CourseTopic, LessonAudience, LessonVenuePanel, PanelCourseTeacher, RabbiHonorific } from '@torabarabim/common';
import { and, eq, inArray, type SQL } from 'drizzle-orm';

import { db, type Tx } from '../../db/client';
import { cities, coursePhotos, courses, places, rabbis } from '../../db/schema';
import { courseLifecycle, type CourseLifecycleResult } from '../course/lifecycle';
import type { AddressCityRow, AddressPlaceRow, VenueRef } from './address';
import { toVenuePanel } from './address';
import type { LessonVenueInputSchema } from './models';
import { assertAudienceAllowedForHonorific, assertAudienceAllowedForRabbi, getRabbiHonorific } from './rabbanit-guard';
import { toRabbiSummary } from './rabbi-summary';
import { toSlug } from './slug';

// The columns both `admin-course` and `rabbi-course` (and the public course
// read) join a course through. `places` and `rabbis` are left joins: a
// course may have neither (an unlinked, address-only course), and the CHECK
// constraints guarantee exactly one of `placeId`/address text and exactly
// one of `rabbiId`/`teacherName` is set.
export const courseSelection = {
  id: courses.id,
  name: courses.name,
  cycle: courses.cycle,
  description: courses.description,
  rabbiId: courses.rabbiId,
  teacherName: courses.teacherName,
  openingDate: courses.openingDate,
  weeks: courses.weeks,
  sessions: courses.sessions,
  hours: courses.hours,
  placeId: courses.placeId,
  addressName: courses.addressName,
  addressStreet: courses.addressStreet,
  addressFloor: courses.addressFloor,
  cityCode: courses.cityCode,
  audience: courses.audience,
  topic: courses.topic,
  topicOther: courses.topicOther,
  joinableAfterOpening: courses.joinableAfterOpening,
  contactPhone: courses.contactPhone,
  priceShekels: courses.priceShekels,
  coverKey: courses.coverKey,
  registrationClosedAt: courses.registrationClosedAt,
  closeReason: courses.closeReason,
  published: courses.published,
  placeSlug: places.slug,
  placeName: places.name,
  placeStreet: places.street,
  placeFloor: places.floor,
  placeIsActive: places.isActive,
  placeCityCode: places.cityCode,
  rabbiName: rabbis.name,
  rabbiHonorific: rabbis.honorific,
  rabbiTitle: rabbis.title,
  rabbiPhotoUrl: rabbis.photoUrl,
  rabbiBio: rabbis.bio,
};

export const baseCourseQuery = () =>
  db
    .select(courseSelection)
    .from(courses)
    .leftJoin(places, eq(courses.placeId, places.id))
    .leftJoin(rabbis, eq(courses.rabbiId, rabbis.id));

export type JoinedCourseRow = Awaited<ReturnType<typeof baseCourseQuery>>[number];

// A course's venue never denormalizes a place's `cityCode` onto its own row
// (decision: read through the place, never copied), so the place arm's
// `cityCode` here always comes from the joined `places` row, not the
// course's own `cityCode` column, which is NULL on that arm.
export const toVenueRefFromRow = (row: JoinedCourseRow): VenueRef =>
  row.placeId !== null
    ? { kind: 'place', placeId: row.placeId, cityCode: row.placeCityCode as number }
    : { kind: 'address', name: row.addressName as string, street: row.addressStreet as string, floor: row.addressFloor ?? undefined, cityCode: row.cityCode as number };

// A single-row map, the same trick `lesson-write.ts`'s `toVenueFromJoinedRow`
// uses: `toVenuePanel`/`toVenue` need a `Map<string, AddressPlaceRow>`, and a
// single course only ever needs its own place in it.
export const placeByIdFromRow = (row: JoinedCourseRow): Map<string, AddressPlaceRow> =>
  new Map(
    row.placeId !== null
      ? [[row.placeId, { id: row.placeId, slug: row.placeSlug as string, name: row.placeName as string, street: row.placeStreet as string, floor: row.placeFloor, isActive: row.placeIsActive as boolean }]]
      : [],
  );

export const toTeacherFromRow = (row: JoinedCourseRow): PanelCourseTeacher =>
  row.rabbiId !== null
    ? {
        kind: 'rabbi',
        rabbiId: row.rabbiId,
        rabbi: toRabbiSummary({
          id: row.rabbiId,
          name: row.rabbiName as string,
          honorific: row.rabbiHonorific as RabbiHonorific,
          title: row.rabbiTitle,
          photoUrl: row.rabbiPhotoUrl,
          bio: row.rabbiBio,
        }),
      }
    : { kind: 'named', name: row.teacherName as string };

export const toCourseTopicFromRow = (row: JoinedCourseRow): CourseTopic | undefined => {
  if (row.topic === null) return undefined;
  return row.topic === 'other' ? { value: 'other', otherText: row.topicOther as string } : { value: row.topic };
};

export const lifecycleFromRow = (row: JoinedCourseRow, today: string): CourseLifecycleResult =>
  courseLifecycle(
    {
      openingDate: row.openingDate,
      weeks: row.weeks,
      joinableAfterOpening: row.joinableAfterOpening,
      registrationClosedAt: row.registrationClosedAt,
      closeReason: row.closeReason as CloseReason | null,
    },
    today,
  );

// The panel's read-side shape: the same fields `rabbi-course` and
// `admin-course` both return, since `CourseResponse` is one type shared by
// both panels. `photos` and `coverKey` carry raw storage keys; the
// convertor is what turns them into URLs.
export interface CourseWriteRecord {
  id: string;
  slug: string;
  name: string;
  cycle?: number;
  description: string;
  teacher: PanelCourseTeacher;
  openingDate: string;
  weeks: number;
  sessions: number;
  hours?: number;
  venue: LessonVenuePanel;
  audience: LessonAudience;
  topic?: CourseTopic;
  joinableAfterOpening: boolean;
  contactPhone: string;
  priceShekels?: number;
  coverKey: string;
  photos: { id: string; storageKey: string }[];
  lifecycle: CourseLifecycleResult;
}

export const toCourseWriteRecord = (
  row: JoinedCourseRow,
  cityByCode: Map<number, AddressCityRow>,
  photos: { id: string; storageKey: string }[],
  today: string,
): CourseWriteRecord => ({
  id: row.id,
  slug: toSlug(row.name) || row.id,
  name: row.name,
  cycle: row.cycle ?? undefined,
  description: row.description,
  teacher: toTeacherFromRow(row),
  openingDate: row.openingDate,
  weeks: row.weeks,
  sessions: row.sessions,
  hours: row.hours ?? undefined,
  venue: toVenuePanel(toVenueRefFromRow(row), cityByCode, placeByIdFromRow(row)),
  audience: row.audience,
  topic: toCourseTopicFromRow(row),
  joinableAfterOpening: row.joinableAfterOpening,
  contactPhone: row.contactPhone,
  priceShekels: row.priceShekels ?? undefined,
  coverKey: row.coverKey,
  photos,
  lifecycle: lifecycleFromRow(row, today),
});

export const loadCoursePhotos = async (courseId: string): Promise<{ id: string; storageKey: string }[]> =>
  db.select({ id: coursePhotos.id, storageKey: coursePhotos.storageKey }).from(coursePhotos).where(eq(coursePhotos.courseId, courseId)).orderBy(coursePhotos.position);

// One query for every course id's gallery, never a query per row: used by
// every list endpoint (the home row, a rabbi's or place's page, both panel
// lists), which each load several courses' photos at once.
export const loadCoursePhotosForMany = async (courseIds: string[]): Promise<Map<string, { id: string; storageKey: string }[]>> => {
  if (courseIds.length === 0) return new Map();

  const rows = await db
    .select({ courseId: coursePhotos.courseId, id: coursePhotos.id, storageKey: coursePhotos.storageKey })
    .from(coursePhotos)
    .where(inArray(coursePhotos.courseId, courseIds))
    .orderBy(coursePhotos.position);

  const byCourseId = new Map<string, { id: string; storageKey: string }[]>();
  for (const row of rows) {
    const existing = byCourseId.get(row.courseId) ?? [];
    existing.push({ id: row.id, storageKey: row.storageKey });
    byCourseId.set(row.courseId, existing);
  }
  return byCourseId;
};

// The full-replacement venue columns a course create/update produces.
// Deliberately does not denormalize a place's `cityCode` the way a lesson
// does: nothing on the course side needs that duplicate, so the place arm
// only verifies the place exists and is active.
export type CourseVenueColumns =
  | { placeId: string; addressName: null; addressStreet: null; addressFloor: null; cityCode: null }
  | { placeId: null; addressName: string; addressStreet: string; addressFloor: string | null; cityCode: number };

export interface CourseVenueColumnsOptions {
  onPlaceNotFound?: (placeId: string) => Error;
  executor?: Tx | typeof db;
}

export const courseVenueColumns = async (venue: LessonVenueInputSchema, options: CourseVenueColumnsOptions = {}): Promise<CourseVenueColumns> => {
  if (venue.kind === 'address') {
    return { placeId: null, addressName: venue.name, addressStreet: venue.street, addressFloor: venue.floor ?? null, cityCode: venue.cityCode };
  }

  const executor = options.executor ?? db;
  const rows = await executor.select({ id: places.id }).from(places).where(and(eq(places.id, venue.placeId), eq(places.isActive, true))).limit(1);
  if (!rows[0]) {
    if (!options.onPlaceNotFound) throw new Error(`data inconsistency: expected an active place '${venue.placeId}' to exist`);
    throw options.onPlaceNotFound(venue.placeId);
  }
  return { placeId: venue.placeId, addressName: null, addressStreet: null, addressFloor: null, cityCode: null };
};

export interface CourseColumnsInput {
  name: string;
  cycle?: number;
  description: string;
  openingDate: string;
  weeks: number;
  sessions: number;
  hours?: number;
  venue: LessonVenueInputSchema;
  audience: LessonAudience;
  topic?: CourseTopic;
  joinableAfterOpening: boolean;
  contactPhone: string;
  priceShekels?: number;
}

// The full-replacement column set both create and update write: every
// optional field clears its column with `?? null` when omitted, so an
// update is a real replacement, never a merge that could leave a stale
// value behind.
export const courseColumnsFrom = async (input: CourseColumnsInput, options: CourseVenueColumnsOptions = {}) => ({
  name: input.name,
  cycle: input.cycle ?? null,
  description: input.description,
  ...(await courseVenueColumns(input.venue, options)),
  audience: input.audience,
  topic: input.topic?.value ?? null,
  topicOther: input.topic?.value === 'other' ? input.topic.otherText : null,
  joinableAfterOpening: input.joinableAfterOpening,
  contactPhone: input.contactPhone,
  priceShekels: input.priceShekels ?? null,
  hours: input.hours ?? null,
  openingDate: input.openingDate,
  weeks: input.weeks,
  sessions: input.sessions,
});

export interface VerifyCourseReferencesOptions {
  // Undefined only for an admin's unlinked course: there is no rabbi to
  // check or to guard the audience against.
  rabbiId?: string;
  cityCode?: number;
  audience: LessonAudience;
  onUnknownCity: (cityCode: number) => Error;
  // Only the admin path needs this: it can name any rabbiId, so its
  // existence has to be checked. The rabbi's own writer never needs it,
  // since its rabbiId is always the authenticated session's own id.
  onReferencedRabbiNotFound?: (rabbiId: string) => Error;
}

export const verifyCourseReferences = async (options: VerifyCourseReferencesOptions): Promise<void> => {
  const { rabbiId, cityCode, audience, onUnknownCity, onReferencedRabbiNotFound } = options;

  const verifyCityExists = async (): Promise<void> => {
    if (cityCode === undefined) return;
    const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.code, cityCode)).limit(1);
    if (!rows[0]) throw onUnknownCity(cityCode);
  };

  if (rabbiId === undefined) {
    await verifyCityExists();
    return;
  }

  if (onReferencedRabbiNotFound) {
    const [honorific] = await Promise.all([getRabbiHonorific(rabbiId), verifyCityExists()]);
    if (honorific === undefined) throw onReferencedRabbiNotFound(rabbiId);
    assertAudienceAllowedForHonorific(honorific, rabbiId, audience);
    return;
  }

  await Promise.all([verifyCityExists(), assertAudienceAllowedForRabbi(rabbiId, audience)]);
};

// Locks the course row for the duration of the write's transaction, then
// returns just enough of it to compute the lifecycle and to name it in an
// error: every write on an existing course must see the same, un-raced view
// of whether it is closed. `whereClause` lets the rabbi path additionally
// scope the lock to its own rabbiId, so it can never lock (or learn the
// existence of) another rabbi's course.
export const lockCourseRow = async (tx: Tx, whereClause: SQL | undefined) => {
  const rows = await tx
    .select({
      id: courses.id,
      name: courses.name,
      openingDate: courses.openingDate,
      weeks: courses.weeks,
      joinableAfterOpening: courses.joinableAfterOpening,
      registrationClosedAt: courses.registrationClosedAt,
      closeReason: courses.closeReason,
    })
    .from(courses)
    .where(whereClause)
    .for('update')
    .limit(1);
  return rows[0];
};
