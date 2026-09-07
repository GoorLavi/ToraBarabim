// Fires when the rabbi row behind an authenticated rabbi session no longer
// exists. This should not happen: deleting a rabbi cascades to delete the
// account too. Kept as a named error, not an assertion, so a data
// inconsistency still maps to a clean 404 instead of an unhandled 500.
export class RabbiNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an existing rabbi, found none with id '${id}'`);
    this.name = 'RabbiNotFoundError';
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
