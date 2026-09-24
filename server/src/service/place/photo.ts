import { loadConfig } from '../../config';
import { readImageDimensions, sniffJpegOrPng } from '../shared/photo-dimensions';
import { PLACE_PHOTO_MAX_ASPECT_RATIO, PLACE_PHOTO_MIN_ASPECT_RATIO, PLACE_PHOTO_MIN_HEIGHT, PLACE_PHOTO_MIN_WIDTH } from './consts';
import { MalformedPlacePhotoHeaderError, PlacePhotoAspectRatioError, PlacePhotoTooLargeError, PlacePhotoTooSmallError, UnsupportedPlacePhotoTypeError } from './errors';

const CONTENT_TYPE_BY_KIND: Record<'jpg' | 'png', string> = { jpg: 'image/jpeg', png: 'image/png' };

export interface ValidatedPlacePhoto {
  contentType: string;
  extension: 'jpg' | 'png';
}

// Validates a place photo, in order: size, type, real dimensions (read from
// the header, never decoded), the two floors, then the aspect ratio band.
// Rejects rather than crops: the owner's call, to avoid an image-decoding
// dependency (no library, no native module, no Dockerfile change) entirely.
//
// The floors and the band are independent checks on purpose: an 800x400
// photo has a ratio of exactly 2.0 (inside the band) and is rejected on the
// height floor alone. A single `min(width, height)` bound would pass it.
//
// Reuses the general upload-size limit (`MAX_UPLOAD_BYTES`, confirmed 5MB
// by its own documented default) rather than a second, place-specific
// constant: it is already documented as "maximum size for a single
// upload", the same config the rabbi photo route reads, not a rabbi-only
// setting that happens to share a name.
//
// Returns the sniffed content type and extension on success, so the one
// caller that needs them to store the file (`admin-place`, `place-portal`)
// never re-sniffs the same bytes a second time.
export const validatePlacePhoto = (bytes: Buffer): ValidatedPlacePhoto => {
  const { maxUploadBytes } = loadConfig(process.env);
  if (bytes.byteLength > maxUploadBytes) throw new PlacePhotoTooLargeError(maxUploadBytes);

  const kind = sniffJpegOrPng(bytes, () => new UnsupportedPlacePhotoTypeError());
  const { width, height } = readImageDimensions(bytes, kind, (malformedKind) => new MalformedPlacePhotoHeaderError(malformedKind));

  if (width < PLACE_PHOTO_MIN_WIDTH) throw new PlacePhotoTooSmallError(width, height);
  if (height < PLACE_PHOTO_MIN_HEIGHT) throw new PlacePhotoTooSmallError(width, height);

  const ratio = width / height;
  if (ratio < PLACE_PHOTO_MIN_ASPECT_RATIO || ratio > PLACE_PHOTO_MAX_ASPECT_RATIO) {
    throw new PlacePhotoAspectRatioError(width, height);
  }

  return { contentType: CONTENT_TYPE_BY_KIND[kind], extension: kind };
};
