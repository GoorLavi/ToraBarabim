// Lifted out of `service/place/photo.ts` when courses became this logic's
// second caller: type sniffing and header dimension reading, shared by
// every domain that validates an uploaded jpg or png without decoding it.
// The floor, the aspect-ratio band, and every domain's own error type stay
// where they were: only the byte-level mechanics move here.

export interface PixelDimensions {
  width: number;
  height: number;
}

export type SniffedImageKind = 'jpg' | 'png';

export const sniffJpegOrPng = (bytes: Buffer, onUnsupportedType: () => Error): SniffedImageKind => {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  throw onUnsupportedType();
};

// PNG carries its dimensions as big-endian uint32s at fixed offsets inside
// the first chunk (IHDR), which always immediately follows the 8-byte
// signature: 4 bytes length, 4 bytes 'IHDR', then width and height. Fails
// closed on a short buffer rather than reading past it.
const readPngDimensions = (bytes: Buffer, onMalformedHeader: (kind: SniffedImageKind) => Error): PixelDimensions => {
  if (bytes.length < 24) throw onMalformedHeader('png');
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
const readJpegDimensions = (bytes: Buffer, onMalformedHeader: (kind: SniffedImageKind) => Error): PixelDimensions => {
  let offset = 2;
  while (offset + 1 < bytes.length) {
    if (bytes[offset] !== 0xff) throw onMalformedHeader('jpg');
    const marker = bytes[offset + 1] as number;
    offset += 2;

    const isStandalone = marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7);
    if (isStandalone) continue;

    if (offset + 1 >= bytes.length) throw onMalformedHeader('jpg');
    const segmentLength = bytes.readUInt16BE(offset);

    // SOF0-SOF15 (0xC0-0xCF), excluding DHT (0xC4) and the two JPG
    // extension markers (0xC8, 0xCC), which share the numeric range but
    // are not a frame header.
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame) {
      if (offset + 6 >= bytes.length) throw onMalformedHeader('jpg');
      // [length(2)][precision(1)][height(2)][width(2)]...
      const height = bytes.readUInt16BE(offset + 3);
      const width = bytes.readUInt16BE(offset + 5);
      return { width, height };
    }

    offset += segmentLength;
  }
  throw onMalformedHeader('jpg');
};

export const readImageDimensions = (
  bytes: Buffer,
  kind: SniffedImageKind,
  onMalformedHeader: (kind: SniffedImageKind) => Error,
): PixelDimensions => (kind === 'png' ? readPngDimensions(bytes, onMalformedHeader) : readJpegDimensions(bytes, onMalformedHeader));
