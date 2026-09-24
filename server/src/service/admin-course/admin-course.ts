import type { CloseReason } from '@torabarabim/common';
import type { FastifyBaseLogger } from 'fastify';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { courses, coursePhotos } from '../../db/schema';
import storage from '../../storage/storage';
import {
  assertCourseWouldNotAlreadyBeClosed,
  assertGalleryHasRoom,
  assertLockedCourseIsOpen,
  comparePanelCourses,
  loadCityByCode,
  validateCoursePhoto,
} from '../course/course';
import { CourseNotClosedError, CourseNotFoundError, CoursePhotoNotFoundError, OpeningDateNotFutureError, ReferencedPlaceNotFoundError, ReferencedRabbiNotFoundError, UnknownCityError } from '../course/errors';
import { compareIsoDates, todayInIsrael } from '../lesson/israel-time';
import {
  baseCourseQuery,
  courseColumnsFrom,
  loadCoursePhotos,
  loadCoursePhotosForMany,
  lockCourseRow,
  toCourseWriteRecord,
  verifyCourseReferences,
  type CourseWriteRecord,
  type JoinedCourseRow,
} from '../shared/course-write';
import type { DuplicateCourseInput, LessonVenueInputSchema } from '../shared/models';
import { toSlug } from '../shared/slug';
import type { AdminCourseListQuery, CourseListResult, CourseTeacherInput, CreateCourseInput, UpdateCourseInput } from './models';

const onPlaceNotFound = (placeId: string): Error => new ReferencedPlaceNotFoundError(placeId);
const onReferencedRabbiNotFound = (rabbiId: string): Error => new ReferencedRabbiNotFoundError(rabbiId);

const teacherColumns = (teacher: CourseTeacherInput): { rabbiId: string | null; teacherName: string | null } =>
  teacher.kind === 'rabbi' ? { rabbiId: teacher.rabbiId, teacherName: null } : { rabbiId: null, teacherName: teacher.name };

const matchesQuery = (row: JoinedCourseRow, query: string): boolean => {
  const normalizedQuery = toSlug(query);
  if (normalizedQuery === '') return true;

  const haystacks = [row.name, row.teacherName, row.rabbiName, row.placeName, row.addressName, row.addressStreet].filter(
    (value): value is string => value !== null,
  );
  return haystacks.some((value) => toSlug(value).includes(normalizedQuery));
};

export const list = async (query: AdminCourseListQuery): Promise<CourseListResult> => {
  const whereClause = query.rabbiId ? eq(courses.rabbiId, query.rabbiId) : undefined;
  const [rows, cityByCode] = await Promise.all([baseCourseQuery().where(whereClause), loadCityByCode()]);

  const today = todayInIsrael(new Date());
  const filteredRows = query.q ? rows.filter((row) => matchesQuery(row, query.q as string)) : rows;
  const photosByCourseId = await loadCoursePhotosForMany(filteredRows.map((row) => row.id));

  const items = filteredRows
    .map((row) => toCourseWriteRecord(row, cityByCode, photosByCourseId.get(row.id) ?? [], today))
    .filter((record) => (query.status === undefined ? true : record.lifecycle.status === query.status))
    .sort(comparePanelCourses);

  const total = items.length;
  const start = (query.page - 1) * query.pageSize;
  return { items: items.slice(start, start + query.pageSize), page: query.page, pageSize: query.pageSize, total };
};

export const getById = async (id: string): Promise<CourseWriteRecord> => {
  const [rows, cityByCode] = await Promise.all([baseCourseQuery().where(eq(courses.id, id)).limit(1), loadCityByCode()]);
  const row = rows[0];
  if (!row) throw new CourseNotFoundError(id);
  const photos = await loadCoursePhotos(id);
  return toCourseWriteRecord(row, cityByCode, photos, todayInIsrael(new Date()));
};

export const create = async (input: CreateCourseInput, coverBytes: Buffer, log: FastifyBaseLogger): Promise<CourseWriteRecord> => {
  const teacher = teacherColumns(input.teacher);
  await verifyCourseReferences({
    rabbiId: teacher.rabbiId ?? undefined,
    cityCode: input.venue.kind === 'address' ? input.venue.cityCode : undefined,
    audience: input.audience,
    onUnknownCity: (cityCode) => new UnknownCityError(cityCode),
    onReferencedRabbiNotFound,
  });
  assertCourseWouldNotAlreadyBeClosed(input, new Date());

  const { contentType, extension } = validateCoursePhoto(coverBytes);
  const id = nanoid();
  const coverKey = `courses/${id}/cover-${nanoid()}.${extension}`;
  await storage.put(coverKey, coverBytes, contentType);

  try {
    await db.insert(courses).values({
      id,
      rabbiId: teacher.rabbiId,
      teacherName: teacher.teacherName,
      coverKey,
      ...(await courseColumnsFrom(input, { onPlaceNotFound })),
    });
  } catch (error) {
    await storage.remove(coverKey).catch((removeError) => log.error({ err: removeError, coverKey }, 'failed to remove orphaned course cover after failed insert'));
    throw error;
  }

  return getById(id);
};

export const update = async (id: string, input: UpdateCourseInput): Promise<CourseWriteRecord> => {
  const teacher = teacherColumns(input.teacher);
  await verifyCourseReferences({
    rabbiId: teacher.rabbiId ?? undefined,
    cityCode: input.venue.kind === 'address' ? input.venue.cityCode : undefined,
    audience: input.audience,
    onUnknownCity: (cityCode) => new UnknownCityError(cityCode),
    onReferencedRabbiNotFound,
  });
  assertCourseWouldNotAlreadyBeClosed(input, new Date());

  await db.transaction(async (tx) => {
    const locked = await lockCourseRow(tx, eq(courses.id, id));
    if (!locked) throw new CourseNotFoundError(id);
    assertLockedCourseIsOpen(locked, new Date());

    await tx
      .update(courses)
      .set({ rabbiId: teacher.rabbiId, teacherName: teacher.teacherName, ...(await courseColumnsFrom(input, { onPlaceNotFound, executor: tx })), updatedAt: new Date() })
      .where(eq(courses.id, id));
  });

  return getById(id);
};

export const remove = async (id: string, log: FastifyBaseLogger): Promise<void> => {
  const { coverKey, photoKeys } = await db.transaction(async (tx) => {
    const rows = await tx.select({ coverKey: courses.coverKey }).from(courses).where(eq(courses.id, id)).limit(1);
    const row = rows[0];
    if (!row) throw new CourseNotFoundError(id);

    const photoRows = await tx.select({ storageKey: coursePhotos.storageKey }).from(coursePhotos).where(eq(coursePhotos.courseId, id));
    await tx.delete(coursePhotos).where(eq(coursePhotos.courseId, id));
    await tx.delete(courses).where(eq(courses.id, id));
    return { coverKey: row.coverKey, photoKeys: photoRows.map((photoRow) => photoRow.storageKey) };
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

const lockablePreCheckRows = (id: string) =>
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
    .where(eq(courses.id, id))
    .limit(1);

export const replaceCover = async (id: string, bytes: Buffer, log: FastifyBaseLogger): Promise<CourseWriteRecord> => {
  const preCheckRows = await lockablePreCheckRows(id);
  const preCheck = preCheckRows[0];
  if (!preCheck) throw new CourseNotFoundError(id);
  assertLockedCourseIsOpen(preCheck, new Date());

  const { contentType, extension } = validateCoursePhoto(bytes);
  const key = `courses/${id}/cover-${nanoid()}.${extension}`;
  await storage.put(key, bytes, contentType);

  let previousKey: string | undefined;
  try {
    await db.transaction(async (tx) => {
      const locked = await lockCourseRow(tx, eq(courses.id, id));
      if (!locked) throw new CourseNotFoundError(id);
      assertLockedCourseIsOpen(locked, new Date());

      const existingRows = await tx.select({ coverKey: courses.coverKey }).from(courses).where(eq(courses.id, id)).limit(1);
      previousKey = existingRows[0]?.coverKey;
      await tx.update(courses).set({ coverKey: key, updatedAt: new Date() }).where(eq(courses.id, id));
    });
  } catch (error) {
    await storage.remove(key).catch((removeError) => log.error({ err: removeError, key }, 'failed to remove orphaned course cover after a refused replace'));
    throw error;
  }

  if (previousKey) {
    storage.remove(previousKey).catch((error) => log.error({ err: error, courseId: id, key: previousKey }, 'failed to delete previous course cover'));
  }

  return getById(id);
};

export const addPhoto = async (id: string, bytes: Buffer, log: FastifyBaseLogger): Promise<CourseWriteRecord> => {
  const preCheckRows = await lockablePreCheckRows(id);
  const preCheck = preCheckRows[0];
  if (!preCheck) throw new CourseNotFoundError(id);
  assertLockedCourseIsOpen(preCheck, new Date());

  const preCountRows = await db.select({ count: sql<number>`count(*)::int` }).from(coursePhotos).where(eq(coursePhotos.courseId, id));
  assertGalleryHasRoom(preCountRows[0]?.count ?? 0);

  const { contentType, extension } = validateCoursePhoto(bytes);
  const key = `courses/${id}/gallery-${nanoid()}.${extension}`;
  await storage.put(key, bytes, contentType);

  try {
    await db.transaction(async (tx) => {
      const locked = await lockCourseRow(tx, eq(courses.id, id));
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

  return getById(id);
};

export const removePhoto = async (id: string, photoId: string, log: FastifyBaseLogger): Promise<void> => {
  const removedKey = await db.transaction(async (tx) => {
    const locked = await lockCourseRow(tx, eq(courses.id, id));
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

const setClosed = async (id: string, reason: CloseReason): Promise<CourseWriteRecord> => {
  await db.transaction(async (tx) => {
    const locked = await lockCourseRow(tx, eq(courses.id, id));
    if (!locked) throw new CourseNotFoundError(id);
    assertLockedCourseIsOpen(locked, new Date());

    await tx
      .update(courses)
      .set({ registrationClosedAt: new Date(), closeReason: reason, updatedAt: new Date() })
      .where(and(eq(courses.id, id), isNull(courses.registrationClosedAt)));
  });

  return getById(id);
};

export const close = (id: string): Promise<CourseWriteRecord> => setClosed(id, 'closed');
export const markFull = (id: string): Promise<CourseWriteRecord> => setClosed(id, 'full');

const extensionFromKey = (key: string): string => key.split('.').pop() ?? 'jpg';

const toVenueInputFromPanel = (venue: CourseWriteRecord['venue']): LessonVenueInputSchema =>
  venue.kind === 'place'
    ? { kind: 'place', placeId: venue.placeId }
    : { kind: 'address', name: venue.name, street: venue.street, floor: venue.floor, cityCode: venue.cityCode };

export const duplicate = async (id: string, input: DuplicateCourseInput, log: FastifyBaseLogger): Promise<CourseWriteRecord> => {
  const source = await getById(id);
  if (source.lifecycle.status !== 'closed') throw new CourseNotClosedError(source.name);

  const today = todayInIsrael(new Date());
  if (compareIsoDates(input.openingDate, today) <= 0) throw new OpeningDateNotFutureError(input.openingDate);

  const venueInput = toVenueInputFromPanel(source.venue);
  await verifyCourseReferences({
    rabbiId: source.teacher.kind === 'rabbi' ? source.teacher.rabbiId : undefined,
    cityCode: venueInput.kind === 'address' ? venueInput.cityCode : undefined,
    audience: source.audience,
    onUnknownCity: (cityCode) => new UnknownCityError(cityCode),
  });

  const newId = nanoid();
  const newCoverKey = `courses/${newId}/cover-${nanoid()}.${extensionFromKey(source.coverKey)}`;
  const newPhotoAssignments = source.photos.map((photo) => ({
    sourceKey: photo.storageKey,
    newId: nanoid(),
    newKey: `courses/${newId}/gallery-${nanoid()}.${extensionFromKey(photo.storageKey)}`,
  }));

  const copiedKeys: string[] = [];
  try {
    await storage.copy(source.coverKey, newCoverKey);
    copiedKeys.push(newCoverKey);
    for (const assignment of newPhotoAssignments) {
      await storage.copy(assignment.sourceKey, assignment.newKey);
      copiedKeys.push(assignment.newKey);
    }

    await db.transaction(async (tx) => {
      await tx.insert(courses).values({
        id: newId,
        rabbiId: source.teacher.kind === 'rabbi' ? source.teacher.rabbiId : null,
        teacherName: source.teacher.kind === 'named' ? source.teacher.name : null,
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

      if (newPhotoAssignments.length) {
        await tx.insert(coursePhotos).values(
          newPhotoAssignments.map((assignment, index) => ({ id: assignment.newId, courseId: newId, storageKey: assignment.newKey, position: index })),
        );
      }
    });
  } catch (error) {
    await Promise.all(
      copiedKeys.map((key) => storage.remove(key).catch((removeError) => log.error({ err: removeError, key }, 'failed to remove copied course object after a refused duplicate'))),
    );
    throw error;
  }

  return getById(newId);
};
