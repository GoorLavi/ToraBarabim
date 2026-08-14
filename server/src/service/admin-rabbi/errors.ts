// Fires when no rabbi exists with the given id. Maps to 404.
export class RabbiNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing rabbi, found none with id '${id}'`);
    this.name = 'RabbiNotFoundError';
  }
}

// Fires when DELETE is called without `confirm=true`. Carries the impact
// preview so the route can hand it straight back in the 409 body.
export class RabbiDeleteConfirmationRequiredError extends Error {
  constructor(
    public readonly lessonCount: number,
    public readonly exceptionCount: number,
  ) {
    super(`Deleting this rabbi requires confirmation: it would destroy ${lessonCount} lesson(s) and ${exceptionCount} exception(s)`);
    this.name = 'RabbiDeleteConfirmationRequiredError';
  }
}

// Fires when the uploaded file's sniffed leading bytes do not match jpeg,
// png, or webp, regardless of what the client claimed as its content type.
export class UnsupportedPhotoTypeError extends Error {
  constructor() {
    super('Expected a jpeg, png, or webp image');
    this.name = 'UnsupportedPhotoTypeError';
  }
}

// Fires when the uploaded file exceeds MAX_UPLOAD_BYTES. Maps to 413.
export class PhotoTooLargeError extends Error {
  constructor(public readonly maxBytes: number) {
    super(`Expected a file of at most ${maxBytes} bytes`);
    this.name = 'PhotoTooLargeError';
  }
}
