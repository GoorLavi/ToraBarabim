import { encodeRgbPng, type RgbImage } from './png-encoder';

// Ratified poster spec (design-system.md, "The poster image"): 2:3 portrait,
// minimum 800x1200. That is also what the admin upload path enforces
// downstream, so the seed generates at that ratio rather than the 3:4 the
// public home-page card currently renders at (a known, out-of-scope
// mismatch between the design system and the card component).
const WIDTH = 800;
const HEIGHT = 1200;

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const hexToRgb = (hex: string): Rgb => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

// The default theme's token set (design-system.md, "אבן ותכלת" and
// siblings): placeholders are drawn from the site's own palette so they
// read as tone and contrast, not stock-photo color.
const PRIMARY = hexToRgb('#6B2436');
const PRIMARY_STRONG = hexToRgb('#521827');
const PRIMARY_SOFT = hexToRgb('#F2E7EA');
const ACCENT = hexToRgb('#B8862B');
const ACCENT_SOFT = hexToRgb('#F9EFDC');
const ACCENT_ON_DARK = hexToRgb('#E0B45E');

const PALETTES: { background: Rgb; bust: Rgb; collar: Rgb }[] = [
  { background: PRIMARY_SOFT, bust: PRIMARY, collar: ACCENT },
  { background: ACCENT_SOFT, bust: PRIMARY_STRONG, collar: ACCENT_ON_DARK },
  { background: PRIMARY, bust: ACCENT_ON_DARK, collar: PRIMARY_SOFT },
  { background: ACCENT, bust: PRIMARY_STRONG, collar: ACCENT_SOFT },
  { background: PRIMARY_SOFT, bust: ACCENT, collar: PRIMARY },
  { background: ACCENT_SOFT, bust: PRIMARY, collar: ACCENT_ON_DARK },
  { background: PRIMARY_STRONG, bust: ACCENT_SOFT, collar: ACCENT },
  { background: ACCENT_ON_DARK, bust: PRIMARY, collar: ACCENT_SOFT },
];

// djb2, just to turn an id string into a numeric seed deterministically.
const hashString = (value: string): number => {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return hash >>> 0;
};

// mulberry32: small, deterministic, good enough to spread portraits apart.
const mulberry32 = (seed: number) => {
  let state = seed;
  return (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;
const lerpRgb = (from: Rgb, to: Rgb, t: number): Rgb => ({
  r: lerp(from.r, to.r, t),
  g: lerp(from.g, to.g, t),
  b: lerp(from.b, to.b, t),
});

class Canvas {
  private readonly pixels: Buffer;

  constructor(
    private readonly width: number,
    private readonly height: number,
  ) {
    this.pixels = Buffer.alloc(width * height * 3);
  }

  setPixel(x: number, y: number, color: Rgb): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const offset = (y * this.width + x) * 3;
    this.pixels[offset] = color.r;
    this.pixels[offset + 1] = color.g;
    this.pixels[offset + 2] = color.b;
  }

  fillVerticalGradient(top: Rgb, bottom: Rgb): void {
    for (let y = 0; y < this.height; y++) {
      const color = lerpRgb(top, bottom, y / (this.height - 1));
      for (let x = 0; x < this.width; x++) this.setPixel(x, y, color);
    }
  }

  fillCircle(cx: number, cy: number, radius: number, color: Rgb): void {
    const top = Math.max(0, Math.floor(cy - radius));
    const bottom = Math.min(this.height - 1, Math.ceil(cy + radius));
    for (let y = top; y <= bottom; y++) {
      const dy = y - cy;
      const halfChord = Math.sqrt(Math.max(0, radius * radius - dy * dy));
      for (let x = Math.round(cx - halfChord); x <= Math.round(cx + halfChord); x++) {
        this.setPixel(x, y, color);
      }
    }
  }

  // A trapezoid that widens from `topWidth` to `bottomWidth` going down,
  // centered on `cx`: the "shoulders" beneath the head circle.
  fillTrapezoid(cx: number, top: number, bottom: number, topWidth: number, bottomWidth: number, color: Rgb): void {
    const clampedTop = Math.max(0, Math.floor(top));
    const clampedBottom = Math.min(this.height - 1, Math.ceil(bottom));
    for (let y = clampedTop; y <= clampedBottom; y++) {
      const t = (y - top) / (bottom - top);
      const halfWidth = lerp(topWidth, bottomWidth, Math.max(0, Math.min(1, t))) / 2;
      for (let x = Math.round(cx - halfWidth); x <= Math.round(cx + halfWidth); x++) {
        this.setPixel(x, y, color);
      }
    }
  }

  toImage(): RgbImage {
    return { width: this.width, height: this.height, pixels: this.pixels };
  }
}

// Generates a deterministic, distinct-per-seed portrait placeholder: an
// abstract bust silhouette on a gradient field, drawn from the site's own
// palette. It is not meant to read as a person, only to give the poster
// slot real tone and contrast while the seed has no real photography.
export const generatePortraitPng = (seed: string): Buffer => {
  const random = mulberry32(hashString(seed));
  const palette = PALETTES[Math.floor(random() * PALETTES.length)]!;

  const canvas = new Canvas(WIDTH, HEIGHT);
  const gradientBottom = lerpRgb(palette.background, { r: 0, g: 0, b: 0 }, 0.12);
  canvas.fillVerticalGradient(palette.background, gradientBottom);

  const headRadius = lerp(140, 190, random());
  const headCenterX = WIDTH / 2 + lerp(-40, 40, random());
  const headCenterY = lerp(360, 460, random());

  canvas.fillTrapezoid(
    headCenterX,
    headCenterY + headRadius * 0.5,
    HEIGHT,
    headRadius * 1.6,
    WIDTH * lerp(1.1, 1.4, random()),
    palette.bust,
  );
  canvas.fillCircle(headCenterX, headCenterY, headRadius, palette.bust);

  // A collar arc: a thin ring at the shoulder line, the one recurring
  // per-rabbi accent so the silhouettes read as a family, not eleven
  // unrelated shapes.
  canvas.fillCircle(headCenterX, headCenterY + headRadius * 0.95, headRadius * 0.22, palette.collar);

  return encodeRgbPng(canvas.toImage());
};
