// Explicit extensions: vite.config.ts reaches this file through the PWA plugin,
// and rasterise.ts runs under plain Node. Neither resolves extensionless imports.
import { argamanVeZahavColors } from '../src/theme/colors/argamanVeZahav.ts';
import { APPLE_TOUCH_ICON_PATH, ICONS_DIRECTORY } from '../src/pwa/consts.ts';
import type { IconJob } from './models.ts';

export const SERVICE_WORKER_SOURCE_FILE = 'sw.js';
export const KILL_SWITCH_SOURCE_FILE = 'sw-kill-switch.js';

export const VERSION_PLACEHOLDER = '__BUILD_VERSION__';
export const VERSION_LENGTH = 12;

// Under public/, which Vite copies into the build after the bundle exists.
export const OFFLINE_PAGE_PUBLIC_PATH = 'pwa/offline.html';

export const ICON_MASTER = 'icon.svg';
// Full bleed with the mark inside the maskable safe zone.
export const MASKABLE_ICON_MASTER = 'icon-maskable.svg';
// The approved iOS splash frame, 430 x 932 points (iPhone Pro Max portrait),
// background included. Each device gets it scaled to its own width.
export const SPLASH_MASTER = 'splash.svg';

export const TOUCH_ICON_SIZE = 180;

export const ICON_JOBS: readonly IconJob[] = [
  { master: ICON_MASTER, outputPath: `${ICONS_DIRECTORY}/icon-192.png`, size: 192 },
  { master: ICON_MASTER, outputPath: `${ICONS_DIRECTORY}/icon-512.png`, size: 512 },
  { master: MASKABLE_ICON_MASTER, outputPath: `${ICONS_DIRECTORY}/icon-maskable-512.png`, size: 512 },
  // iOS applies its own mask, so the touch icon is a full-bleed square, but it
  // keeps the general cut of the mark (68%), not the smaller maskable one. The
  // general master over a field of the primary token gives exactly that.
  { master: ICON_MASTER, outputPath: APPLE_TOUCH_ICON_PATH, size: TOUCH_ICON_SIZE, fieldColor: argamanVeZahavColors.primary },
];

export const MASTER_MIME_TYPES: Record<string, string> = { '.svg': 'image/svg+xml', '.png': 'image/png' };
