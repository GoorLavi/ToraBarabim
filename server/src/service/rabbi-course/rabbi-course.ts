import type { FastifyBaseLogger } from 'fastify';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { courses } from '../../db/schema';
import storage from '../../storage/storage';
import { assertCourseWouldNotAlreadyBeClosed, comparePanelCourses } from '../course/course';
import { CourseNotFoundError, ReferencedPlaceNotFoundError, UnknownCityError } from '../course/errors';
import { todayInIsrael } from '../lesson/israel-time';
import {
  addCourseGalleryPhoto,
  assertLockedCourseIsOpen,
  baseCourseQuery,
  courseColumnsFrom,
  duplicateCourse,
  getCourseWriteRecord,
  loadCityByCode,
  loadCoursePhotosForMany,
  lockCourseRow,
  removeCourse,
  removeCourseGalleryPhoto,
  replaceCourseCover,
  setCourseClosed,
  toCourseWriteRecord,
  validateCoursePhoto,
  verifyCourseReferences,
  type CourseWriteRecord,
} from '../shared/course-write';
import type { CourseListResult, DuplicateCourseInput } from '../shared/models';
import type { CreateRabbiCourseInput, RabbiCourseListQuery, UpdateRabbiCourseInput } from './models';

const onPlaceNotFound = (placeId: string): Error => new ReferencedPlaceNotFoundError(placeId);
const onUnknownCity = (cityCode: number): Error => new UnknownCityError(cityCode);

// A rabbi's own course is always linked to himself; a duplicate keeps that
// teacher shape, matching `DuplicateCourseTeacherColumns`.
const ownTeacherColumns = (rabbiId: string) => ({ rabbiId, teacherName: null });

const ownerClause = (rabbiId: string) => eq(courses.rabbiId, rabbiId);

export const list = async (rabbiId: string, query: RabbiCourseListQuery): Promise<CourseListResult> => {
  const whereClause = ownerClause(rabbiId);
  const [rows, cityByCode] = await Promise.all([baseCourseQuery().where(whereClause), loadCityByCode()]);

  const today = todayInIsrael(new Date());
  // Sorted and paged on a record built with no photos yet: only the page's
  // own rows are worth a photo query, not every row this rabbi has.
  const sorted = rows.map((row) => toCourseWriteRecord(row, cityByCode, [], today)).sort(comparePanelCourses);

  const total = sorted.length;
  const start = (query.page - 1) * query.pageSize;
  const page = sorted.slice(start, start + query.pageSize);

  const photosByCourseId = await loadCoursePhotosForMany(page.map((record) => record.id));
  const items = page.map((record) => ({ ...record, photos: photosByCourseId.get(record.id) ?? [] }));

  return { items, page: query.page, pageSize: query.pageSize, total };
};

export const getOwnById = (rabbiId: string, id: string): Promise<CourseWriteRecord> => getCourseWriteRecord(id, ownerClause(rabbiId));

export const create = async (rabbiId: string, input: CreateRabbiCourseInput, coverBytes: Buffer, log: FastifyBaseLogger): Promise<CourseWriteRecord> => {
  await verifyCourseReferences({
    rabbiId,
    cityCode: input.venue.kind === 'address' ? input.venue.cityCode : undefined,
    audience: input.audience,
    onUnknownCity,
  });
  assertCourseWouldNotAlreadyBeClosed(input, new Date());

  // The active-place check lives inside `courseColumnsFrom` (via
  // `courseVenueColumns`); computing it before the cover is validated and
  // uploaded means a bad `placeId` never triggers an upload at all.
  const columns = await courseColumnsFrom(input, { onPlaceNotFound });

  const { contentType, extension } = validateCoursePhoto(coverBytes);
  const id = nanoid();
  const coverKey = `courses/${id}/cover-${nanoid()}.${extension}`;
  await storage.put(coverKey, coverBytes, contentType);

  try {
    await db.insert(courses).values({ id, rabbiId, teacherName: null, coverKey, ...columns });
  } catch (error) {
    await storage.remove(coverKey).catch((removeError) => log.error({ err: removeError, coverKey }, 'failed to remove orphaned course cover after failed insert'));
    throw error;
  }

  return getOwnById(rabbiId, id);
};

export const update = async (rabbiId: string, id: string, input: UpdateRabbiCourseInput): Promise<CourseWriteRecord> => {
  await verifyCourseReferences({
    rabbiId,
    cityCode: input.venue.kind === 'address' ? input.venue.cityCode : undefined,
    audience: input.audience,
    onUnknownCity,
  });

  await db.transaction(async (tx) => {
    const locked = await lockCourseRow(tx, and(eq(courses.id, id), ownerClause(rabbiId)));
    if (!locked) throw new CourseNotFoundError(id);
    assertLockedCourseIsOpen(locked, new Date());
    assertCourseWouldNotAlreadyBeClosed(input, new Date());

    await tx
      .update(courses)
      .set({ ...(await courseColumnsFrom(input, { onPlaceNotFound, executor: tx })), updatedAt: new Date() })
      .where(eq(courses.id, id));
  });

  return getOwnById(rabbiId, id);
};

export const remove = (rabbiId: string, id: string, log: FastifyBaseLogger): Promise<void> => removeCourse(id, ownerClause(rabbiId), log);

export const replaceCover = async (rabbiId: string, id: string, bytes: Buffer, log: FastifyBaseLogger): Promise<CourseWriteRecord> => {
  await replaceCourseCover(id, ownerClause(rabbiId), bytes, log);
  return getOwnById(rabbiId, id);
};

export const addPhoto = async (rabbiId: string, id: string, bytes: Buffer, log: FastifyBaseLogger): Promise<CourseWriteRecord> => {
  await addCourseGalleryPhoto(id, ownerClause(rabbiId), bytes, log);
  return getOwnById(rabbiId, id);
};

export const removePhoto = (rabbiId: string, id: string, photoId: string, log: FastifyBaseLogger): Promise<void> =>
  removeCourseGalleryPhoto(id, ownerClause(rabbiId), photoId, log);

export const close = async (rabbiId: string, id: string): Promise<CourseWriteRecord> => {
  await setCourseClosed(id, ownerClause(rabbiId), 'closed');
  return getOwnById(rabbiId, id);
};

export const markFull = async (rabbiId: string, id: string): Promise<CourseWriteRecord> => {
  await setCourseClosed(id, ownerClause(rabbiId), 'full');
  return getOwnById(rabbiId, id);
};

export const duplicate = async (rabbiId: string, id: string, input: DuplicateCourseInput, log: FastifyBaseLogger): Promise<CourseWriteRecord> => {
  const source = await getOwnById(rabbiId, id);
  const newId = await duplicateCourse(source, ownTeacherColumns(rabbiId), input, onUnknownCity, log);
  return getOwnById(rabbiId, newId);
};
