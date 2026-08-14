// Fires when the parent lesson named in the route does not exist. Maps to 404.
export class LessonNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing lesson, found none with id '${id}'`);
    this.name = 'LessonNotFoundError';
  }
}

// Fires when no exception exists with the given id on the given lesson. Maps to 404.
export class ExceptionNotFoundError extends Error {
  constructor(id: number, lessonId: string) {
    super(`Expected an existing exception with id '${id}' on lesson '${lessonId}', found none`);
    this.name = 'ExceptionNotFoundError';
  }
}

// Fires when an exception already exists for this lesson on this date;
// the `lesson_exceptions_lesson_date` unique constraint would otherwise
// surface as a raw database error. Maps to 409.
export class DuplicateExceptionError extends Error {
  constructor(lessonId: string, date: string) {
    super(`An exception already exists for lesson '${lessonId}' on '${date}'`);
    this.name = 'DuplicateExceptionError';
  }
}

// Fires when the given date is not actually produced by the lesson's
// recurrence rule (wrong weekday for a 'weekly' lesson, or any date other
// than the one 'once' lesson's date). Maps to 400.
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

// Fires when a 'modified' exception names an override place that does not exist. Maps to 400.
export class ReferencedPlaceNotFoundError extends Error {
  constructor(public readonly placeId: string) {
    super(`Expected an existing place, found none with id '${placeId}'`);
    this.name = 'ReferencedPlaceNotFoundError';
  }
}
