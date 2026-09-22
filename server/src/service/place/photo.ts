import { loadConfig } from '../../config';
import { PLACE_PHOTO_MAX_ASPECT_RATIO, PLACE_PHOTO_MIN_ASPECT_RATIO, PLACE_PHOTO_MIN_HEIGHT, PLACE_PHOTO_MIN_WIDTH } from './consts';
import { MalformedPlacePhotoHeaderError, PlacePhotoAspectRatioError, PlacePhotoTooLargeError, PlacePhotoTooSmallError, UnsupportedPlacePhotoTypeError } from './errors';

interface PixelDimensions {
  width: number;
  height: number;
}

// PNG carries its dimensions as big-endian uint32s at fixed offsets inside
// the first chunk (IHDR), which always immediately follows the 8-byte
// signature: 4 bytes length, 4 bytes 'IHDR', then width and height. Fails
// closed on a short buffer rather than reading past it.
const readPngDimensions = (bytes: Buffer): PixelDimensions => {
  if (bytes.length < 24) throw new MalformedPlacePhotoHeaderError('png');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};

// JPEG has no fixed offset: its dimensions live on the first Start-Of-Frame
// marker, reached by walking the marker chain from byte 2. Every marker is
// 0xFF followed by a one-byte kind; a marker that carries a segment (i.e.
// every one except the handful of standalone markers below) is followed by
// a two-byte big-endian length covering itself, which is how the chain
// skips to the next marker without understanding the segment's own
// content. Fails closed: a chain that runs off the end of the buffer, or
// never reaches a SOF, throws rather than reading past the buffer or
// guessing a size.
const readJpegDimensions = (bytes: Buffer): PixelDimensions => {
  let offset = 2;
  while (offset + 1 < bytes.length) {
    if (bytes[offset] !== 0xff) throw new MalformedPlacePhotoHeaderError('jpg');
    const marker = bytes[offset + 1] as number;
    offset += 2;

    const isStandalone = marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7);
    if (isStandalone) continue;

    if (offset + 1 >= bytes.length) throw new MalformedPlacePhotoHeaderError('jpg');
    const segmentLength = bytes.readUInt16BE(offset);

    // SOF0-SOF15 (0xC0-0xCF), excluding DHT (0xC4) and the two JPG
    // extension markers (0xC8, 0xCC), which share the numeric range but
    // are not a frame header.
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame) {
      if (offset + 6 >= bytes.length) throw new MalformedPlacePhotoHeaderError('jpg');
      // [length(2)][precision(1)][height(2)][width(2)]...
      const height = bytes.readUInt16BE(offset + 3);
      const width = bytes.readUInt16BE(offset + 5);
      return { width, height };
    }

    offset += segmentLength;
  }
  throw new MalformedPlacePhotoHeaderError('jpg');
};

const sniff = (bytes: Buffer): 'jpg' | 'png' => {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  throw new UnsupportedPlacePhotoTypeError();
};

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
// The floors and the band are independent checks on purpose: a 1200x600
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

  const kind = sniff(bytes);
  const { width, height } = kind === 'png' ? readPngDimensions(bytes) : readJpegDimensions(bytes);

  if (width < PLACE_PHOTO_MIN_WIDTH) throw new PlacePhotoTooSmallError(width, height);
  if (height < PLACE_PHOTO_MIN_HEIGHT) throw new PlacePhotoTooSmallError(width, height);

  const ratio = width / height;
  if (ratio < PLACE_PHOTO_MIN_ASPECT_RATIO || ratio > PLACE_PHOTO_MAX_ASPECT_RATIO) {
    throw new PlacePhotoAspectRatioError(width, height);
  }

  return { contentType: CONTENT_TYPE_BY_KIND[kind], extension: kind };
};
