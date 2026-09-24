import type { AudienceScope, CourseTeacher, LessonAudience, PanelCourseTeacher } from '@torabarabim/common';
import { and, eq } from 'drizzle-orm';

import { db } from '../../db/client';
import { cities, courses } from '../../db/schema';
import type { AddressCityRow } from '../shared/address';
import { toVenue } from '../shared/address';
import {
  baseCourseQuery,
  lifecycleFromRow,
  loadCoursePhotos,
  placeByIdFromRow,
  toTeacherFromRow,
  toVenueRefFromRow,
  type CourseWriteRecord,
  type JoinedCourseRow,
} from '../shared/course-write';
import { loadConfig } from '../../config';
import { todayInIsrael } from '../lesson/israel-time';
import { readImageDimensions, sniffJpegOrPng } from '../shared/photo-dimensions';
import { toSlug } from '../shared/slug';
import { COURSE_GALLERY_MAX_PHOTOS, COURSE_PHOTO_MIN_SIDE } from './consts';
import { courseLifecycle, type CourseLifecycleInput } from './lifecycle';
import {
  CourseClosedError,
  CourseGalleryFullError,
  CourseNotFoundError,
  CoursePhotoTooLargeError,
  CoursePhotoTooSmallError,
  CourseWouldBeClosedError,
  MalformedCoursePhotoHeaderError,
  UnsupportedCoursePhotoTypeError,
} from './errors';
import type { CourseDetailRecord, CourseSummaryRecord } from './models';

// `general`: men or mixed. `women`: women or mixed, the same as a lesson's
// own scope rule. Unlike a lesson, this never depends on the teacher's
// honorific: a rav's own women-only course still leaves the general
// surfaces, deliberately unlike his women-only lesson (spec section 5).
export const isCourseInScope = (scope: AudienceScope, audience: LessonAudience): boolean =>
  scope === 'women' ? audience === 'women' || audience === 'mixed' : audience === 'men' || audience === 'mixed';

const toPublicTeacher = (teacher: PanelCourseTeacher): CourseTeacher => (teacher.kind === 'rabbi' ? { kind: 'rabbi', rabbi: teacher.rabbi } : teacher);

const toCourseSummary = (row: JoinedCourseRow, cityByCode: Map<number, AddressCityRow>, today: string): CourseSummaryRecord => ({
  id: row.id,
  slug: toSlug(row.name) || row.id,
  name: row.name,
  cycle: row.cycle ?? undefined,
  coverKey: row.coverKey,
  openingDate: row.openingDate,
  teacher: toPublicTeacher(toTeacherFromRow(row)),
  venue: toVenue(toVenueRefFromRow(row), cityByCode, placeByIdFromRow(row)),
  audience: row.audience,
  lifecycle: lifecycleFromRow(row, today),
});

const toCourseDetail = (row: JoinedCourseRow, cityByCode: Map<number, AddressCityRow>, photos: { id: string; storageKey: string }[], today: string): CourseDetailRecord => ({
  ...toCourseSummary(row, cityByCode, today),
  description: row.description,
  weeks: row.weeks,
  sessions: row.sessions,
  hours: row.hours ?? undefined,
  priceShekels: row.priceShekels ?? undefined,
  contactPhone: row.contactPhone,
  topic: row.topic === null ? undefined : row.topic === 'other' ? { value: 'other', otherText: row.topicOther as string } : { value: row.topic },
  photos,
});

export const loadCityByCode = async (): Promise<Map<number, AddressCityRow>> => {
  const rows = await db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area }).from(cities);
  return new Map(rows.map((row) => [row.code, row] as const));
};

export const getPublicById = async (id: string, now: Date): Promise<CourseDetailRecord> => {
  const today = todayInIsrael(now);
  const [rows, cityByCode] = await Promise.all([baseCourseQuery().where(and(eq(courses.id, id), eq(courses.published, true))).limit(1), loadCityByCode()]);
  const row = rows[0];
  if (!row) throw new CourseNotFoundError(id);
  const photos = await loadCoursePhotos(id);
  return toCourseDetail(row, cityByCode, photos, today);
};

// Registration-open courses (notOpen or open) first, then closed ones, each
// group ordered by opening date soonest first, then id as the final,
// deterministic tie-break.
const compareCourseSummaries = (a: CourseSummaryRecord, b: CourseSummaryRecord): number => {
  const aClosed = a.lifecycle.status === 'closed';
  const bClosed = b.lifecycle.status === 'closed';
  if (aClosed !== bClosed) return aClosed ? 1 : -1;

  const byOpeningDate = a.openingDate < b.openingDate ? -1 : a.openingDate > b.openingDate ? 1 : 0;
  if (byOpeningDate !== 0) return byOpeningDate;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
};

// Every listed course (never queried per row: one load of the whole table,
// then a pure filter and sort) in a given scope, optionally narrowed to one
// rabbi or one place. Shared by the home row, a rabbi's page, a place's
// page, and the women's area: the four surfaces differ only in scope and
// narrowing, never in what "listed" means.
const listCourses = async (
  scope: AudienceScope,
  now: Date,
  narrow: { rabbiId?: string; placeId?: string } = {},
): Promise<CourseSummaryRecord[]> => {
  const today = todayInIsrael(now);
  const [rows, cityByCode] = await Promise.all([baseCourseQuery().where(eq(courses.published, true)), loadCityByCode()]);

  return rows
    .filter((row) => isCourseInScope(scope, row.audience))
    .filter((row) => (narrow.rabbiId === undefined ? true : row.rabbiId === narrow.rabbiId))
    .filter((row) => (narrow.placeId === undefined ? true : row.placeId === narrow.placeId))
    .map((row) => toCourseSummary(row, cityByCode, today))
    .filter((summary) => summary.lifecycle.isListed)
    .sort(compareCourseSummaries);
};

export const listForHomeRow = (now: Date): Promise<CourseSummaryRecord[]> => listCourses('general', now);

export const listForRabbi = (rabbiId: string, scope: AudienceScope, now: Date): Promise<CourseSummaryRecord[]> => listCourses(scope, now, { rabbiId });

export const listForPlace = (placeId: string, now: Date): Promise<CourseSummaryRecord[]> => listCourses('general', now, { placeId });

export const listForWomenArea = (now: Date): Promise<CourseSummaryRecord[]> => listCourses('women', now);

// A panel list's own order (owner, addendum): not-closed courses first, by
// opening date ascending, then closed ones (closed or full alike) by their
// own closing date descending, so the most recently closed sits first.
// Deliberately different from the public row's order, which never sorts a
// closed group by anything but its opening date.
export const comparePanelCourses = (a: CourseWriteRecord, b: CourseWriteRecord): number => {
  const aClosed = a.lifecycle.status === 'closed';
  const bClosed = b.lifecycle.status === 'closed';
  if (aClosed !== bClosed) return aClosed ? 1 : -1;

  if (a.lifecycle.status === 'closed' && b.lifecycle.status === 'closed') {
    if (a.lifecycle.closedOn !== b.lifecycle.closedOn) return a.lifecycle.closedOn < b.lifecycle.closedOn ? 1 : -1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  }

  return a.openingDate < b.openingDate ? -1 : a.openingDate > b.openingDate ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
};

// A create or an update whose own fields would already resolve to a closed
// course today is refused: without this, one typo in the opening date
// freezes a course for good, since only delete and duplicate remain once
// closed.
export const assertCourseWouldNotAlreadyBeClosed = (
  fields: { openingDate: string; weeks: number; joinableAfterOpening: boolean },
  now: Date,
): void => {
  const today = todayInIsrael(now);
  const result = courseLifecycle({ ...fields, registrationClosedAt: null, closeReason: null }, today);
  if (result.status === 'closed') throw new CourseWouldBeClosedError(fields.openingDate);
};

const COURSE_PHOTO_CONTENT_TYPE_BY_KIND: Record<'jpg' | 'png', string> = { jpg: 'image/jpeg', png: 'image/png' };

export interface ValidatedCoursePhoto {
  contentType: string;
  extension: 'jpg' | 'png';
}

// Validates a course photo (cover or gallery), in order: size, type, the
// floor on the shorter side. No aspect-ratio check: the cover's ratio is
// the picker's job (it crops to 3:4 before upload), and a gallery photo
// keeps its own ratio outright, so the server never rejects one on shape.
export const validateCoursePhoto = (bytes: Buffer): ValidatedCoursePhoto => {
  const { maxUploadBytes } = loadConfig(process.env);
  if (bytes.byteLength > maxUploadBytes) throw new CoursePhotoTooLargeError(maxUploadBytes);

  const kind = sniffJpegOrPng(bytes, () => new UnsupportedCoursePhotoTypeError());
  const { width, height } = readImageDimensions(bytes, kind, (malformedKind) => new MalformedCoursePhotoHeaderError(malformedKind));

  const shortestSide = Math.min(width, height);
  if (shortestSide < COURSE_PHOTO_MIN_SIDE) throw new CoursePhotoTooSmallError(shortestSide);

  return { contentType: COURSE_PHOTO_CONTENT_TYPE_BY_KIND[kind], extension: kind };
};

export interface LockedCourseRow {
  name: string;
  openingDate: string;
  weeks: number;
  joinableAfterOpening: boolean;
  registrationClosedAt: Date | null;
  // Read straight off the `close_reason` column, which is plain `text`
  // (this slice adds no new Postgres enum): always 'closed' or 'full' in
  // practice, since only the close and full routes ever write it.
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
// row's own lock, inside the write's transaction (`galleryCount` there is
// read from the same transaction, so it can never race a concurrent add).
export const assertGalleryHasRoom = (currentCount: number): void => {
  if (currentCount >= COURSE_GALLERY_MAX_PHOTOS) throw new CourseGalleryFullError(COURSE_GALLERY_MAX_PHOTOS);
};
