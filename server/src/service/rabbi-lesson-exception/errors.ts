// Fires when the lesson id in the route does not exist, *or* exists but
// belongs to a different rabbi. One class for both, so a rabbi probing
// another rabbi's lesson id gets the same 404 as a random string; see the
// matching comment in `service/rabbi-lesson/errors.ts`. Maps to 404.
export class LessonNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing lesson owned by this rabbi, found none with id '${id}'`);
    this.name = 'LessonNotFoundError';
  }
}

// Fires when no exception exists with the given id on the given lesson. The
// lesson ownership check already happened, so this always means the
// exception id itself is wrong. Maps to 404.
export class ExceptionNotFoundError extends Error {
  constructor(id: number, lessonId: string) {
    super(`Expected an existing exception with id '${id}' on lesson '${lessonId}', found none`);
    this.name = 'ExceptionNotFoundError';
  }
}

// Fires when an exception already exists for this lesson on this date. Maps to 409.
export class DuplicateExceptionError extends Error {
  constructor(lessonId: string, date: string) {
    super(`An exception already exists for lesson '${lessonId}' on '${date}'`);
    this.name = 'DuplicateExceptionError';
  }
}

// Fires when the given date is not actually produced by the lesson's
// recurrence rule. Maps to 400.
export class DateNotInRecurrenceError extends Error {
  constructor(lessonId: string, date: string) {
    super(`Lesson '${lessonId}' has no occurrence on '${date}' according to its recurrence rule`);
    this.name = 'DateNotInRecurrenceError';
  }
}

// Fires when a 'modified' exception names a substitute rabbi that does not exist. Maps to 400.
export class ReferencedRabbiNotFoundError extends Error {
  constructor(public readonly rabbiId: string) {
    super(`Expected an existing rabbi, found none with id '${rabbiId}'`);
    this.name = 'ReferencedRabbiNotFoundError';
  }
}

// Fires when a 'modified' exception's place override names a cityCode that
// does not resolve to a row in `cities`. Maps to 400.
export class UnknownCityError extends Error {
  constructor(public readonly cityCode: number) {
    super(`Expected a known city code, got '${cityCode}'`);
    this.name = 'UnknownCityError';
  }
}
