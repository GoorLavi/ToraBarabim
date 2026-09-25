import type { FastifyBaseLogger } from 'fastify';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { courses } from '../../db/schema';
import storage from '../../storage/storage';
import { assertCourseWouldNotAlreadyBeClosed, comparePanelCourses } from '../course/course';
import { CourseNotFoundError, ReferencedPlaceNotFoundError, ReferencedRabbiNotFoundError, UnknownCityError } from '../course/errors';
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
  type JoinedCourseRow,
} from '../shared/course-write';
import type { CourseListResult, DuplicateCourseInput } from '../shared/models';
import { toSlug } from '../shared/slug';
import type { AdminCourseListQuery, CourseTeacherInput, CreateCourseInput, UpdateCourseInput } from './models';

const onPlaceNotFound = (placeId: string): Error => new ReferencedPlaceNotFoundError(placeId);
const onUnknownCity = (cityCode: number): Error => new UnknownCityError(cityCode);
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

// The three-bucket filter, not the lifecycle's own three-value status:
// `open` is registration still open (`notOpen` or `open`), and a closed
// course splits by its own `reason` into `full` and `closed`.
const matchesStatusFilter = (record: CourseWriteRecord, status: AdminCourseListQuery['status']): boolean => {
  if (status === undefined) return true;
  if (status === 'open') return record.lifecycle.status !== 'closed';
  return record.lifecycle.status === 'closed' && record.lifecycle.reason === status;
};

export const list = async (query: AdminCourseListQuery): Promise<CourseListResult> => {
  const whereClause = query.rabbiId ? eq(courses.rabbiId, query.rabbiId) : undefined;
  const [rows, cityByCode] = await Promise.all([baseCourseQuery().where(whereClause), loadCityByCode()]);

  const today = todayInIsrael(new Date());
  const filteredRows = query.q ? rows.filter((row) => matchesQuery(row, query.q as string)) : rows;

  // Sorted, status-filtered and paged on a record built with no photos yet:
  // only the page's own rows are worth a photo query, not every match.
  const sorted = filteredRows
    .map((row) => toCourseWriteRecord(row, cityByCode, [], today))
    .filter((record) => matchesStatusFilter(record, query.status))
    .sort(comparePanelCourses);

  const total = sorted.length;
  const start = (query.page - 1) * query.pageSize;
  const page = sorted.slice(start, start + query.pageSize);

  const photosByCourseId = await loadCoursePhotosForMany(page.map((record) => record.id));
  const items = page.map((record) => ({ ...record, photos: photosByCourseId.get(record.id) ?? [] }));

  return { items, page: query.page, pageSize: query.pageSize, total };
};

export const getById = (id: string): Promise<CourseWriteRecord> => getCourseWriteRecord(id, undefined);

export const create = async (input: CreateCourseInput, coverBytes: Buffer, log: FastifyBaseLogger): Promise<CourseWriteRecord> => {
  const teacher = teacherColumns(input.teacher);
  await verifyCourseReferences({
    rabbiId: teacher.rabbiId ?? undefined,
    cityCode: input.venue.kind === 'address' ? input.venue.cityCode : undefined,
    audience: input.audience,
    onUnknownCity,
    onReferencedRabbiNotFound,
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
    await db.insert(courses).values({ id, rabbiId: teacher.rabbiId, teacherName: teacher.teacherName, coverKey, ...columns });
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
    onUnknownCity,
    onReferencedRabbiNotFound,
  });

  await db.transaction(async (tx) => {
    const locked = await lockCourseRow(tx, eq(courses.id, id));
    if (!locked) throw new CourseNotFoundError(id);
    assertLockedCourseIsOpen(locked, new Date());
    assertCourseWouldNotAlreadyBeClosed(input, new Date());

    await tx
      .update(courses)
      .set({ rabbiId: teacher.rabbiId, teacherName: teacher.teacherName, ...(await courseColumnsFrom(input, { onPlaceNotFound, executor: tx })), updatedAt: new Date() })
      .where(eq(courses.id, id));
  });

  return getById(id);
};

export const remove = (id: string, log: FastifyBaseLogger): Promise<void> => removeCourse(id, undefined, log);

export const replaceCover = async (id: string, bytes: Buffer, log: FastifyBaseLogger): Promise<CourseWriteRecord> => {
  await replaceCourseCover(id, undefined, bytes, log);
  return getById(id);
};

export const addPhoto = async (id: string, bytes: Buffer, log: FastifyBaseLogger): Promise<CourseWriteRecord> => {
  await addCourseGalleryPhoto(id, undefined, bytes, log);
  return getById(id);
};

export const removePhoto = (id: string, photoId: string, log: FastifyBaseLogger): Promise<void> => removeCourseGalleryPhoto(id, undefined, photoId, log);

export const close = async (id: string): Promise<CourseWriteRecord> => {
  await setCourseClosed(id, undefined, 'closed');
  return getById(id);
};

export const markFull = async (id: string): Promise<CourseWriteRecord> => {
  await setCourseClosed(id, undefined, 'full');
  return getById(id);
};

export const duplicate = async (id: string, input: DuplicateCourseInput, log: FastifyBaseLogger): Promise<CourseWriteRecord> => {
  const source = await getById(id);
  const teacher = source.teacher.kind === 'rabbi' ? { rabbiId: source.teacher.rabbiId, teacherName: null } : { rabbiId: null, teacherName: source.teacher.name };
  const newId = await duplicateCourse(source, teacher, input, onUnknownCity, log);
  return getById(newId);
};
