import type { CloseReason, CourseTopic, LessonAudience, LessonVenuePanel, PanelCourseTeacher, RabbiHonorific } from '@torabarabim/common';
import type { FastifyBaseLogger } from 'fastify';
import { and, eq, inArray, isNull, sql, type SQL } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { loadConfig } from '../../config';
import { db, type Tx } from '../../db/client';
import { cities, coursePhotos, courses, places, rabbis } from '../../db/schema';
import {
  CourseClosedError,
  CourseGalleryFullError,
  CourseNotClosedError,
  CourseNotFoundError,
  CoursePhotoNotFoundError,
  CoursePhotoTooLargeError,
  OpeningDateNotFutureError,
  UnsupportedCoursePhotoTypeError,
} from '../course/errors';
import { COURSE_GALLERY_MAX_PHOTOS } from '../course/consts';
import { courseLifecycle, type CourseLifecycleInput, type CourseLifecycleResult } from '../course/lifecycle';
import { compareIsoDates, todayInIsrael } from '../lesson/israel-time';
import storage from '../../storage/storage';
import type { AddressCityRow, AddressPlaceRow, VenueRef } from './address';
import { toVenuePanel } from './address';
import type { DuplicateCourseInput, LessonVenueInputSchema } from './models';
import { assertAudienceAllowedForHonorific, assertAudienceAllowedForRabbi, getRabbiHonorific } from './rabbanit-guard';
import { sniffJpegOrPng } from './photo-dimensions';
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

export const loadCityByCode = async (): Promise<Map<number, AddressCityRow>> => {
  const rows = await db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area }).from(cities);
  return new Map(rows.map((row) => [row.code, row] as const));
};

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

// The one read both panels' `GET /:id` share, differing only in whether the
// caller narrows to its own rabbiId (`ownerClause`) or not (`undefined`, the
// admin path). Row, city reference data and photos load together: none
// depends on another's result.
export const getCourseWriteRecord = async (id: string, ownerClause: SQL | undefined): Promise<CourseWriteRecord> => {
  const [rows, cityByCode, photos] = await Promise.all([
    baseCourseQuery().where(and(eq(courses.id, id), ownerClause)).limit(1),
    loadCityByCode(),
    loadCoursePhotos(id),
  ]);
  const row = rows[0];
  if (!row) throw new CourseNotFoundError(id);
  return toCourseWriteRecord(row, cityByCode, photos, todayInIsrael(new Date()));
};

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
// returns just enough of it to compute the lifecycle, to name it in an
// error, and (for `removeCourse`) to know its cover key: every write on an
// existing course must see the same, un-raced view of whether it is closed.
// `whereClause` must already include `eq(courses.id, id)`: a fully
// `undefined` clause would lock an arbitrary row instead of failing, so this
// refuses to run without one rather than trusting every future caller to
// remember.
export const lockCourseRow = async (tx: Tx, whereClause: SQL | undefined) => {
  if (!whereClause) throw new Error('lockCourseRow requires a where clause; refusing to lock the whole table');

  const rows = await tx
    .select({
      id: courses.id,
      name: courses.name,
      coverKey: courses.coverKey,
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

export interface LockedCourseRow {
  name: string;
  openingDate: string;
  weeks: number;
  joinableAfterOpening: boolean;
  registrationClosedAt: Date | null;
  // Read straight off the `close_reason` column, which is plain `text`
  // (this slice adds no new Postgres enum): `courses_close_shape` guarantees
  // it is 'closed' or 'full' whenever it is set at all.
  closeReason: string | null;
}

// Every write on an existing course (other than delete and duplicate) must
// see the same, locked view of whether it is closed: this reads that
// locked row's own lifecycle and throws the one closed-course error both
// panels share, with the reason the card and page would actually show.
export const assertLockedCourseIsOpen = (locked: LockedCourseRow, now: Date): void => {
  const input: CourseLifecycleInput = { ...locked, closeReason: locked.closeReason as CourseLifecycleInput['closeReason'] };
  const result = courseLifecycle(input, todayInIsrael(now));
  if (result.status === 'closed') throw new CourseClosedError(locked.name, result.reason);
};

// The cheap check before `storage.put`: refuses the common case without
// ever uploading. The authoritative check happens again under the course
// row's own lock, inside the write's transaction.
export const assertGalleryHasRoom = (currentCount: number): void => {
  if (currentCount >= COURSE_GALLERY_MAX_PHOTOS) throw new CourseGalleryFullError(COURSE_GALLERY_MAX_PHOTOS);
};

const COURSE_PHOTO_CONTENT_TYPE_BY_KIND: Record<'jpg' | 'png', string> = { jpg: 'image/jpeg', png: 'image/png' };

export interface ValidatedCoursePhoto {
  contentType: string;
  extension: 'jpg' | 'png';
}

// Size and type, shared by the cover and the gallery: the owner's call at
// his hand run is that a course photo of any size is accepted, and the
// client warns about blur before upload instead ("לקבל כל גודל, עם אזהרה על
// טשטוש"), so no dimension is read here at all. No aspect-ratio check
// either: the cover's ratio is the picker's job (it crops to 3:4 before
// upload), and a gallery photo keeps its own ratio outright.
export const validateCoursePhoto = (bytes: Buffer): ValidatedCoursePhoto => {
  const { maxUploadBytes } = loadConfig(process.env);
  if (bytes.byteLength > maxUploadBytes) throw new CoursePhotoTooLargeError(maxUploadBytes);

  const kind = sniffJpegOrPng(bytes, () => new UnsupportedCoursePhotoTypeError());
  return { contentType: COURSE_PHOTO_CONTENT_TYPE_BY_KIND[kind], extension: kind };
};

// An unlocked read, cheap enough to run before `storage.put` so the common
// case (a closed course) never uploads. The lock inside the write's own
// transaction is what actually decides; this only short-circuits early.
const readCourseForPrecheck = (id: string, ownerClause: SQL | undefined) =>
  db
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
    .where(and(eq(courses.id, id), ownerClause))
    .limit(1);

// Deleting a course locks the row first (a concurrent `addCourseGalleryPhoto`
// on the same id would otherwise still be free to insert a gallery row
// between this function's own delete statements and hit a foreign-key
// error instead of a clean 404), deletes its gallery rows and itself in one
// transaction, then removes every object it owned. `ownerClause` is
// `undefined` on the admin path, or `eq(courses.rabbiId, rabbiId)` on the
// rabbi's own.
export const removeCourse = async (id: string, ownerClause: SQL | undefined, log: FastifyBaseLogger): Promise<void> => {
  const { coverKey, photoKeys } = await db.transaction(async (tx) => {
    const locked = await lockCourseRow(tx, and(eq(courses.id, id), ownerClause));
    if (!locked) throw new CourseNotFoundError(id);

    const photoRows = await tx.select({ storageKey: coursePhotos.storageKey }).from(coursePhotos).where(eq(coursePhotos.courseId, id));
    await tx.delete(coursePhotos).where(eq(coursePhotos.courseId, id));
    await tx.delete(courses).where(eq(courses.id, id));
    return { coverKey: locked.coverKey, photoKeys: photoRows.map((row) => row.storageKey) };
  });

  await Promise.all(
    [coverKey, ...photoKeys].map(async (key) => {
      try {
        await storage.remove(key);
      } catch (error) {
        log.error({ err: error, courseId: id, key }, 'failed to delete storage object for removed course');
      }
    }),
  );
};

export const replaceCourseCover = async (id: string, ownerClause: SQL | undefined, bytes: Buffer, log: FastifyBaseLogger): Promise<void> => {
  const preCheckRows = await readCourseForPrecheck(id, ownerClause);
  const preCheck = preCheckRows[0];
  if (!preCheck) throw new CourseNotFoundError(id);
  assertLockedCourseIsOpen(preCheck, new Date());

  const { contentType, extension } = validateCoursePhoto(bytes);
  const key = `courses/${id}/cover-${nanoid()}.${extension}`;
  await storage.put(key, bytes, contentType);

  let previousKey: string | undefined;
  try {
    await db.transaction(async (tx) => {
      const locked = await lockCourseRow(tx, and(eq(courses.id, id), ownerClause));
      if (!locked) throw new CourseNotFoundError(id);
      assertLockedCourseIsOpen(locked, new Date());
      previousKey = locked.coverKey;
      await tx.update(courses).set({ coverKey: key, updatedAt: new Date() }).where(eq(courses.id, id));
    });
  } catch (error) {
    await storage.remove(key).catch((removeError) => log.error({ err: removeError, key }, 'failed to remove orphaned course cover after a refused replace'));
    throw error;
  }

  if (previousKey) {
    storage.remove(previousKey).catch((error) => log.error({ err: error, courseId: id, key: previousKey }, 'failed to delete previous course cover'));
  }
};

export const addCourseGalleryPhoto = async (id: string, ownerClause: SQL | undefined, bytes: Buffer, log: FastifyBaseLogger): Promise<void> => {
  const [preCheckRows, preCountRows] = await Promise.all([
    readCourseForPrecheck(id, ownerClause),
    db.select({ count: sql<number>`count(*)::int` }).from(coursePhotos).where(eq(coursePhotos.courseId, id)),
  ]);
  const preCheck = preCheckRows[0];
  if (!preCheck) throw new CourseNotFoundError(id);
  assertLockedCourseIsOpen(preCheck, new Date());
  assertGalleryHasRoom(preCountRows[0]?.count ?? 0);

  const { contentType, extension } = validateCoursePhoto(bytes);
  const key = `courses/${id}/gallery-${nanoid()}.${extension}`;
  await storage.put(key, bytes, contentType);

  try {
    await db.transaction(async (tx) => {
      const locked = await lockCourseRow(tx, and(eq(courses.id, id), ownerClause));
      if (!locked) throw new CourseNotFoundError(id);
      assertLockedCourseIsOpen(locked, new Date());

      const countRows = await tx.select({ count: sql<number>`count(*)::int` }).from(coursePhotos).where(eq(coursePhotos.courseId, id));
      assertGalleryHasRoom(countRows[0]?.count ?? 0);

      const maxPositionRows = await tx.select({ maxPosition: sql<number | null>`max(${coursePhotos.position})` }).from(coursePhotos).where(eq(coursePhotos.courseId, id));
      const nextPosition = (maxPositionRows[0]?.maxPosition ?? -1) + 1;
      await tx.insert(coursePhotos).values({ id: nanoid(), courseId: id, storageKey: key, position: nextPosition });
    });
  } catch (error) {
    await storage.remove(key).catch((removeError) => log.error({ err: removeError, key }, 'failed to remove orphaned course gallery photo after a refused add'));
    throw error;
  }
};

export const removeCourseGalleryPhoto = async (id: string, ownerClause: SQL | undefined, photoId: string, log: FastifyBaseLogger): Promise<void> => {
  const removedKey = await db.transaction(async (tx) => {
    const locked = await lockCourseRow(tx, and(eq(courses.id, id), ownerClause));
    if (!locked) throw new CourseNotFoundError(id);
    assertLockedCourseIsOpen(locked, new Date());

    const photoRows = await tx.select({ storageKey: coursePhotos.storageKey }).from(coursePhotos).where(and(eq(coursePhotos.id, photoId), eq(coursePhotos.courseId, id))).limit(1);
    const photoRow = photoRows[0];
    if (!photoRow) throw new CoursePhotoNotFoundError(photoId);

    await tx.delete(coursePhotos).where(eq(coursePhotos.id, photoId));
    return photoRow.storageKey;
  });

  try {
    await storage.remove(removedKey);
  } catch (error) {
    log.error({ err: error, courseId: id, photoId }, 'failed to delete course gallery photo object');
  }
};

export const setCourseClosed = async (id: string, ownerClause: SQL | undefined, reason: CloseReason): Promise<void> => {
  await db.transaction(async (tx) => {
    const locked = await lockCourseRow(tx, and(eq(courses.id, id), ownerClause));
    if (!locked) throw new CourseNotFoundError(id);
    assertLockedCourseIsOpen(locked, new Date());

    await tx
      .update(courses)
      .set({ registrationClosedAt: new Date(), closeReason: reason, updatedAt: new Date() })
      .where(and(eq(courses.id, id), isNull(courses.registrationClosedAt)));
  });
};

const extensionFromKey = (key: string): string => key.split('.').pop() ?? 'jpg';

// Rebuilds the create-shaped venue input from an already-resolved read
// record: a deactivated place has already fallen back to `kind: 'address'`
// with its last-known name and street (`toVenuePanel`'s own fallback), so
// duplicating it naturally copies that address, exactly what an edit and
// save of the source course would also produce.
const toVenueInputFromPanel = (venue: LessonVenuePanel): LessonVenueInputSchema =>
  venue.kind === 'place'
    ? { kind: 'place', placeId: venue.placeId }
    : { kind: 'address', name: venue.name, street: venue.street, floor: venue.floor, cityCode: venue.cityCode };

export interface DuplicateCourseTeacherColumns {
  rabbiId: string | null;
  teacherName: string | null;
}

// The whole duplicate flow: the closed and future-date checks, the
// reference checks, copying the cover and every gallery photo as new
// objects under `courses/<newId>/`, and the insert, all in one place so the
// rabbi panel and the admin panel can never drift apart on what "duplicate"
// means. `teacher` is the caller's own choice (rabbi: always itself; admin:
// the source's own teacher, since duplicate never reassigns one), passed in
// rather than derived here, so a future caller can differ deliberately.
// Returns the new course's id; the caller re-reads it through its own
// scoped getter, matching how `create` and `update` already read back.
export const duplicateCourse = async (
  source: CourseWriteRecord,
  teacher: DuplicateCourseTeacherColumns,
  input: DuplicateCourseInput,
  onUnknownCity: (cityCode: number) => Error,
  log: FastifyBaseLogger,
): Promise<string> => {
  if (source.lifecycle.status !== 'closed') throw new CourseNotClosedError(source.name);

  const today = todayInIsrael(new Date());
  if (compareIsoDates(input.openingDate, today) <= 0) throw new OpeningDateNotFutureError(input.openingDate);

  const venueInput = toVenueInputFromPanel(source.venue);
  await verifyCourseReferences({
    rabbiId: teacher.rabbiId ?? undefined,
    cityCode: venueInput.kind === 'address' ? venueInput.cityCode : undefined,
    audience: source.audience,
    onUnknownCity,
  });

  const newId = nanoid();
  const newCoverKey = `courses/${newId}/cover-${nanoid()}.${extensionFromKey(source.coverKey)}`;
  const photoAssignments = source.photos.map((photo) => ({
    id: nanoid(),
    sourceKey: photo.storageKey,
    newKey: `courses/${newId}/gallery-${nanoid()}.${extensionFromKey(photo.storageKey)}`,
  }));

  const copyJobs = [{ sourceKey: source.coverKey, newKey: newCoverKey }, ...photoAssignments.map((assignment) => ({ sourceKey: assignment.sourceKey, newKey: assignment.newKey }))];
  const copyResults = await Promise.allSettled(copyJobs.map((job) => storage.copy(job.sourceKey, job.newKey)));

  const firstFailure = copyResults.find((result): result is PromiseRejectedResult => result.status === 'rejected');
  if (firstFailure) {
    const succeededKeys = copyJobs.filter((_job, index) => copyResults[index]?.status === 'fulfilled').map((job) => job.newKey);
    await Promise.all(
      succeededKeys.map((key) => storage.remove(key).catch((removeError) => log.error({ err: removeError, key }, 'failed to remove copied course object after a partly failed duplicate'))),
    );
    throw firstFailure.reason;
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(courses).values({
        id: newId,
        rabbiId: teacher.rabbiId,
        teacherName: teacher.teacherName,
        coverKey: newCoverKey,
        registrationClosedAt: null,
        closeReason: null,
        ...(await courseColumnsFrom(
          {
            name: source.name,
            cycle: input.cycle,
            description: source.description,
            openingDate: input.openingDate,
            weeks: source.weeks,
            sessions: source.sessions,
            hours: source.hours,
            venue: venueInput,
            audience: source.audience,
            topic: source.topic,
            joinableAfterOpening: source.joinableAfterOpening,
            contactPhone: source.contactPhone,
            priceShekels: source.priceShekels,
          },
          { executor: tx },
        )),
      });

      if (photoAssignments.length) {
        await tx.insert(coursePhotos).values(photoAssignments.map((assignment, index) => ({ id: assignment.id, courseId: newId, storageKey: assignment.newKey, position: index })));
      }
    });
  } catch (error) {
    await Promise.all(
      copyJobs.map((job) => storage.remove(job.newKey).catch((removeError) => log.error({ err: removeError, key: job.newKey }, 'failed to remove copied course object after a refused duplicate'))),
    );
    throw error;
  }

  return newId;
};
