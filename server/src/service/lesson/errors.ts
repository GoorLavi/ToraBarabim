// Fires when `to` is before `from`, or the requested range exceeds
// MAX_RANGE_DAYS. Maps to 400: the request itself is malformed.
export class InvalidDateRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDateRangeError';
  }
}

// Fires when no lesson exists with the given id. Maps to 404.
export class LessonNotFoundError extends Error {
  constructor(lessonId: string) {
    super(`no lesson found with id ${lessonId}`);
    this.name = 'LessonNotFoundError';
  }
}

// Fires when the lesson exists but its recurrence rule produces no
// occurrence on the requested date. Maps to 404, the same status as
// LessonNotFoundError: the lesson page shows one "not found" screen either
// way, and the caller has no use for telling the two apart.
export class LessonOccurrenceNotFoundError extends Error {
  constructor(lessonId: string, date: string) {
    super(`lesson ${lessonId} has no occurrence on ${date}`);
    this.name = 'LessonOccurrenceNotFoundError';
  }
}
