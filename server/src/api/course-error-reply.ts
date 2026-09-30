import type { CourseErrorBody, CourseErrorCode } from '@torabarabim/common';

import { CourseClosedError, CourseGalleryFullError, CourseNotClosedError, CourseWouldBeClosedError, CoverRequiredError, OpeningDateNotFutureError, UnsupportedCoursePhotoTypeError } from '../service/course/errors';
import { RabbanitAudienceMustBeWomenError } from '../service/shared/errors';

// The HTTP status for each of the eight course-specific codes, read by both
// panel routers so the status and the body they send can never drift apart.
export const COURSE_ERROR_STATUS: Record<CourseErrorCode, number> = {
  rabbanit_audience_must_be_women: 400,
  course_would_be_closed: 400,
  opening_date_not_future: 400,
  unsupported_file_type: 400,
  cover_required: 400,
  course_closed: 409,
  course_not_closed: 409,
  course_photo_limit: 409,
};

// Builds the one wire body for a thrown course error, shared by both panel
// routers instead of built twice, by hand, in each router's own
// `handleError`. Returns `undefined` for anything that is not one of the
// eight course-specific codes, so a caller falls through to its own generic
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

  if (error instanceof UnsupportedCoursePhotoTypeError) {
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
