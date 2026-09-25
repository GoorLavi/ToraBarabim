import type { CourseErrorBody, CourseErrorCode } from '@torabarabim/common';

import { COURSE_COVER_MIN_HEIGHT, COURSE_COVER_MIN_WIDTH, COURSE_GALLERY_PHOTO_MIN_SIDE } from '../service/course/consts';
import {
  CourseClosedError,
  CourseGalleryFullError,
  CourseNotClosedError,
  CoursePhotoTooSmallError,
  CourseWouldBeClosedError,
  CoverRequiredError,
  MalformedCoursePhotoHeaderError,
  OpeningDateNotFutureError,
  UnsupportedCoursePhotoTypeError,
} from '../service/course/errors';
import { RabbanitAudienceMustBeWomenError } from '../service/shared/errors';

// The HTTP status for each of the nine course-specific codes, read by both
// panel routers so the status and the body they send can never drift apart.
export const COURSE_ERROR_STATUS: Record<CourseErrorCode, number> = {
  rabbanit_audience_must_be_women: 400,
  course_would_be_closed: 400,
  opening_date_not_future: 400,
  photo_too_small: 400,
  unsupported_file_type: 400,
  cover_required: 400,
  course_closed: 409,
  course_not_closed: 409,
  course_photo_limit: 409,
};

// The exhaustive list of the nine codes, derived from `COURSE_ERROR_STATUS`
// rather than duplicated: that Record already fails the type check if a code
// is missing, the same guarantee `db/schema/enums.ts` gets from mirroring a
// wire union with `satisfies`. `common` ships types only, so this runtime
// list lives here, not beside `CourseErrorCode` itself.
export const COURSE_ERROR_CODES = Object.keys(COURSE_ERROR_STATUS) as CourseErrorCode[];

// Builds the one wire body for a thrown course error, shared by both panel
// routers instead of built twice, by hand, in each router's own
// `handleError`. Returns `undefined` for anything that is not one of the
// nine course-specific codes, so a caller falls through to its own generic
// handling for the codes this union deliberately does not type (not found,
// unknown city, malformed request, and so on).
export const toCourseErrorBody = (error: unknown): CourseErrorBody | undefined => {
  if (error instanceof RabbanitAudienceMustBeWomenError) {
    return { error: 'rabbanit_audience_must_be_women', message: error.message, details: { audience: error.audience } };
  }

  if (error instanceof CourseWouldBeClosedError) {
    return { error: 'course_would_be_closed', message: error.message, details: { openingDate: error.openingDate } };
  }

  if (error instanceof OpeningDateNotFutureError) {
    return { error: 'opening_date_not_future', message: error.message, details: { openingDate: error.openingDate } };
  }

  if (error instanceof CoursePhotoTooSmallError) {
    const details =
      error.kind === 'cover'
        ? { kind: 'cover' as const, measuredWidth: error.width, measuredHeight: error.height, minWidth: COURSE_COVER_MIN_WIDTH, minHeight: COURSE_COVER_MIN_HEIGHT }
        : { kind: 'gallery' as const, measuredShorterSide: Math.min(error.width, error.height), minimum: COURSE_GALLERY_PHOTO_MIN_SIDE };
    return { error: 'photo_too_small', message: error.message, details };
  }

  if (error instanceof UnsupportedCoursePhotoTypeError || error instanceof MalformedCoursePhotoHeaderError) {
    return { error: 'unsupported_file_type', message: error.message, details: {} };
  }

  if (error instanceof CoverRequiredError) {
    return { error: 'cover_required', message: error.message, details: {} };
  }

  if (error instanceof CourseClosedError) {
    return { error: 'course_closed', message: error.message, details: { courseName: error.courseName, reason: error.reason } };
  }

  if (error instanceof CourseNotClosedError) {
    return { error: 'course_not_closed', message: error.message, details: { courseName: error.courseName } };
  }

  if (error instanceof CourseGalleryFullError) {
    return { error: 'course_photo_limit', message: error.message, details: { max: error.max } };
  }

  return undefined;
};
