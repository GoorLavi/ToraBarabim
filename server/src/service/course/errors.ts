import type { CloseReason } from '@torabarabim/common';

// Fires when no course exists with the given id, or (on a rabbi's own
// routes) when it exists but belongs to another rabbi. One class for both,
// deliberately: a rabbi probing another rabbi's course id must get the
// exact same 404 he would get for a random string. Maps to 404.
export class CourseNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing course, found none with id '${id}'`);
    this.name = 'CourseNotFoundError';
  }
}

// Fires when a write other than delete or duplicate targets a course whose
// registration has already closed (by the calendar, by hand, or marked
// full): a closed course is read-only. Maps to 409.
export class CourseClosedError extends Error {
  constructor(
    public readonly courseName: string,
    public readonly reason: CloseReason,
  ) {
    super(`Expected an open course, '${courseName}' is closed (${reason})`);
    this.name = 'CourseClosedError';
  }
}

// Fires when duplicate is attempted on a course whose registration is not
// yet closed. Maps to 409.
export class CourseNotClosedError extends Error {
  constructor(public readonly courseName: string) {
    super(`Expected a closed course, '${courseName}' is still open`);
    this.name = 'CourseNotClosedError';
  }
}

// Fires when a create or update's own fields would already resolve to a
// closed course on today's date: without this, one typo in the opening date
// would freeze a course for good, since only delete and duplicate remain
// once closed. Maps to 400.
export class CourseWouldBeClosedError extends Error {
  constructor(public readonly openingDate: string) {
    super(`Expected a course whose registration would not already be closed today, got opening date '${openingDate}'`);
    this.name = 'CourseWouldBeClosedError';
  }
}

// Fires when a duplicate's new opening date is not strictly after today in
// Israel time. Maps to 400.
export class OpeningDateNotFutureError extends Error {
  constructor(public readonly openingDate: string) {
    super(`Expected a future opening date, got '${openingDate}'`);
    this.name = 'OpeningDateNotFutureError';
  }
}

// Fires when the uploaded file's sniffed leading bytes are not jpeg or png.
export class UnsupportedCoursePhotoTypeError extends Error {
  constructor() {
    super('Expected a jpeg or png image');
    this.name = 'UnsupportedCoursePhotoTypeError';
  }
}

// Fires when the uploaded file exceeds the configured upload limit. Maps to 413.
export class CoursePhotoTooLargeError extends Error {
  constructor(public readonly maxBytes: number) {
    super(`Expected a file of at most ${maxBytes} bytes`);
    this.name = 'CoursePhotoTooLargeError';
  }
}

// Fires when a multipart create has no `cover` file part. Maps to 400.
export class CoverRequiredError extends Error {
  constructor() {
    super('Expected a cover file part named \'cover\'');
    this.name = 'CoverRequiredError';
  }
}

// Fires when a multipart create's `course` field part is missing, or is
// present but is not valid JSON. Maps to 400.
export class MalformedCourseFieldsError extends Error {
  constructor() {
    super("Expected a well-formed JSON field part named 'course'");
    this.name = 'MalformedCourseFieldsError';
  }
}

// Fires when the gallery already holds `COURSE_GALLERY_MAX_PHOTOS` rows.
// Maps to 409.
export class CourseGalleryFullError extends Error {
  constructor(public readonly max: number) {
    super(`Expected fewer than ${max} gallery photos already stored`);
    this.name = 'CourseGalleryFullError';
  }
}

// Fires when a photoId does not belong to the given course. Maps to 404,
// the same as an unknown course id: never reveals whether the photo exists
// on someone else's course.
export class CoursePhotoNotFoundError extends Error {
  constructor(photoId: string) {
    super(`Expected an existing gallery photo on this course, found none with id '${photoId}'`);
    this.name = 'CoursePhotoNotFoundError';
  }
}

// Fires when a create/update names a cityCode that does not resolve to a
// row in `cities`. Maps to 400.
export class UnknownCityError extends Error {
  constructor(public readonly cityCode: number) {
    super(`Expected a known city code, got '${cityCode}'`);
    this.name = 'UnknownCityError';
  }
}

// Fires when a create/update names a venue.placeId that does not resolve to
// an active place. Maps to 400.
export class ReferencedPlaceNotFoundError extends Error {
  constructor(public readonly placeId: string) {
    super(`Expected an existing, active place, found none with id '${placeId}'`);
    this.name = 'ReferencedPlaceNotFoundError';
  }
}

// Fires when the admin path names a rabbiId that does not exist. Maps to 400.
export class ReferencedRabbiNotFoundError extends Error {
  constructor(public readonly rabbiId: string) {
    super(`Expected an existing rabbi, found none with id '${rabbiId}'`);
    this.name = 'ReferencedRabbiNotFoundError';
  }
}
