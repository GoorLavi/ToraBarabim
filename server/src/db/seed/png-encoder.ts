import { deflateSync } from 'node:zlib';

// A minimal, dependency-free PNG encoder. It exists only because the seed
// generates placeholder portraits without a raster or canvas library in the
// server workspace, and adding one for a handful of seed images is not
// worth a new dependency. It writes exactly what the seed needs: an 8-bit
// RGB image, one IHDR/IDAT/IEND, no filtering beyond "none" per scanline.

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// CRC-32 as required by the PNG spec (ISO 3309), computed once per chunk.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (buffer: Buffer): number => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (type: string, data: Buffer): Buffer => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
};

export interface RgbImage {
  width: number;
  height: number;
  // Row-major, 3 bytes (R, G, B) per pixel, no padding.
  pixels: Buffer;
}

export const encodeRgbPng = (image: RgbImage): Buffer => {
  const { width, height, pixels } = image;

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type 2: truecolor (RGB)
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const rowBytes = width * 3;
  const raw = Buffer.alloc((rowBytes + 1) * height);
  for (let y = 0; y < height; y++) {
    const srcStart = y * rowBytes;
    const dstStart = y * (rowBytes + 1);
    raw[dstStart] = 0; // filter type: none
    pixels.copy(raw, dstStart + 1, srcStart, srcStart + rowBytes);
  }

  const idat = deflateSync(raw);

  return Buffer.concat([PNG_SIGNATURE, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
};
