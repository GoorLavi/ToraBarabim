// Explicit extension: vite.config.ts reaches this file through the PWA plugin,
// and Vite's native config loader resolves nothing without one.
import type { ManifestIcon, ServiceWorkerMode, SplashScreen } from './models.ts';

// Flip to 'killSwitch' and deploy to retire the worker for good: the build then
// emits sw-kill-switch.js as /sw.js, so every browser holding a worker
// replaces it with one that deletes the caches and unregisters itself.
// The emergency route that does not wait for a deploy is in infra/README.md.
export const SERVICE_WORKER_MODE: ServiceWorkerMode = 'active';

export const SERVICE_WORKER_PATH = '/sw.js';
export const SERVICE_WORKER_SCOPE = '/';

export const MANIFEST_PATH = '/manifest.webmanifest';
export const OFFLINE_PAGE_PATH = '/pwa/offline.html';

export const LAUNCH_SOURCE_PARAM = 'source';
export const LAUNCH_SOURCE_PWA = 'pwa';
export const MANIFEST_START_URL = `/?${LAUNCH_SOURCE_PARAM}=${LAUNCH_SOURCE_PWA}`;

export const STANDALONE_DISPLAY_MEDIA_QUERY = '(display-mode: standalone)';

export const APPLE_TOUCH_ICON_PATH = '/apple-touch-icon.png';
export const ICONS_DIRECTORY = '/pwa/icons';
export const SPLASH_DIRECTORY = '/pwa/splash';

export const MANIFEST_ICONS: readonly ManifestIcon[] = [
  { src: `${ICONS_DIRECTORY}/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: `${ICONS_DIRECTORY}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: `${ICONS_DIRECTORY}/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];

// Portrait iPhones only: an installed site that rotates is rare, and every
// entry costs one PNG in the repo and one link tag on every document. A device
// with no exact match gets no splash image, only the manifest background, which
// is the same plain argaman field. Entries are the iPhones iOS 17 and later
// still runs, newest first.
export const SPLASH_SCREENS: readonly SplashScreen[] = [
  { width: 440, height: 956, pixelRatio: 3 },
  { width: 430, height: 932, pixelRatio: 3 },
  { width: 428, height: 926, pixelRatio: 3 },
  { width: 414, height: 896, pixelRatio: 3 },
  { width: 414, height: 896, pixelRatio: 2 },
  { width: 402, height: 874, pixelRatio: 3 },
  { width: 393, height: 852, pixelRatio: 3 },
  { width: 390, height: 844, pixelRatio: 3 },
  { width: 375, height: 812, pixelRatio: 3 },
  { width: 375, height: 667, pixelRatio: 2 },
];
