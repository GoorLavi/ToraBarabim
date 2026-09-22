// Fires when no *active* place exists with the given id, whether because no
// row ever existed or because it is deactivated. One class for both: a
// deactivated place answers exactly the same 404 as one that never existed,
// never a 410, because deactivation is reversible. Maps to 404.
export class PlaceNotFoundError extends Error {
  constructor(id: string) {
    super(`Expected an active place, found none with id '${id}'`);
    this.name = 'PlaceNotFoundError';
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

// Fires when the uploaded file's sniffed leading bytes are not jpg or png.
// Narrower than the rabbi photo sniffer, which also takes webp.
export class UnsupportedPlacePhotoTypeError extends Error {
  constructor() {
    super('Expected a jpg or png image');
    this.name = 'UnsupportedPlacePhotoTypeError';
  }
}

// Fires when the uploaded file exceeds the configured upload limit. Maps to 413.
export class PlacePhotoTooLargeError extends Error {
  constructor(public readonly maxBytes: number) {
    super(`Expected a file of at most ${maxBytes} bytes`);
    this.name = 'PlacePhotoTooLargeError';
  }
}

// Fires when the file's own header is too short or malformed to read real
// dimensions from, without decoding the image. Fails closed: a truncated or
// corrupt file is rejected, never guessed at.
export class MalformedPlacePhotoHeaderError extends Error {
  constructor(kind: 'jpg' | 'png') {
    super(`Expected a well-formed ${kind} header to read its dimensions from`);
    this.name = 'MalformedPlacePhotoHeaderError';
  }
}

// Fires when the photo's real width or height is below its own floor.
export class PlacePhotoTooSmallError extends Error {
  constructor(public readonly width: number, public readonly height: number) {
    super(`Expected at least 800x450, got ${width}x${height}`);
    this.name = 'PlacePhotoTooSmallError';
  }
}

// Fires when the photo's width/height ratio falls outside the allowed band.
export class PlacePhotoAspectRatioError extends Error {
  constructor(public readonly width: number, public readonly height: number) {
    super(`Expected a width/height ratio between 1.5 and 2.0, got ${width}x${height}`);
    this.name = 'PlacePhotoAspectRatioError';
  }
}
