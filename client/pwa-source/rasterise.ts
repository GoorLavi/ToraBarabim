// Run by hand, never by the build: `npm run pwa:rasterise -w client`.
// Reads the approved masters from pwa-source/masters/ and writes the icons and
// the iOS splash images into public/, where they are committed. The PNGs are
// output, not source: rerun this after a master changes, never edit one.
//
// Optional arguments, used to try the script on throwaway masters without
// touching the repository: `<mastersDirectory> <publicDirectory>`.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';
import type { Page } from 'playwright';

import { argamanVeZahavColors } from '../src/theme/colors/argamanVeZahav.ts';
import { APPLE_TOUCH_ICON_PATH, ICONS_DIRECTORY, SPLASH_DIRECTORY, SPLASH_SCREENS } from '../src/pwa/consts.ts';
import { splashImagePath, splashImageSize } from '../src/pwa/helpers.ts';

const ICON_MASTER = 'icon.svg';
// Full bleed with the mark inside the maskable safe zone. Also the source of
// the touch icon, which iOS masks itself and so also wants a full-bleed square.
const MASKABLE_ICON_MASTER = 'icon-maskable.svg';
// The mark and wordmark on a transparent background; the argaman field behind
// it is drawn here from the colour token.
const SPLASH_MASTER = 'splash.svg';

// TODO: tora-designer sets the real figure when the splash is approved. Until
// then the composition is centred at this share of the screen width.
const SPLASH_MASTER_WIDTH_SHARE = 0.4;

const TOUCH_ICON_SIZE = 180;

interface IconJob {
  master: string;
  outputPath: string;
  size: number;
}

const ICON_JOBS: readonly IconJob[] = [
  { master: ICON_MASTER, outputPath: `${ICONS_DIRECTORY}/icon-192.png`, size: 192 },
  { master: ICON_MASTER, outputPath: `${ICONS_DIRECTORY}/icon-512.png`, size: 512 },
  { master: MASKABLE_ICON_MASTER, outputPath: `${ICONS_DIRECTORY}/icon-maskable-512.png`, size: 512 },
  { master: MASKABLE_ICON_MASTER, outputPath: APPLE_TOUCH_ICON_PATH, size: TOUCH_ICON_SIZE },
];

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const mastersDirectory = path.resolve(process.argv[2] ?? path.join(scriptDirectory, 'masters'));
const publicDirectory = path.resolve(process.argv[3] ?? path.join(scriptDirectory, '../public'));

const MIME_TYPES: Record<string, string> = { '.svg': 'image/svg+xml', '.png': 'image/png' };

const readMasterAsDataUri = (fileName: string): string => {
  const masterPath = path.join(mastersDirectory, fileName);
  const mimeType = MIME_TYPES[path.extname(fileName)];
  if (mimeType === undefined) throw new Error(`Expected a .svg or .png master, got ${masterPath}`);

  let bytes: Buffer;
  try {
    bytes = readFileSync(masterPath);
  } catch (cause) {
    throw new Error(`Expected the approved master at ${masterPath}, which could not be read. Add it from the design hand-off.`, { cause });
  }
  return `data:${mimeType};base64,${bytes.toString('base64')}`;
};

const writePng = (publicPath: string, png: Buffer): void => {
  const outputPath = path.join(publicDirectory, publicPath);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, png);
  console.log(`wrote ${outputPath} (${png.length} bytes)`);
};

// A fixed viewport at device scale factor 1 means the screenshot is exactly the
// requested pixel size on every machine, whatever the display it runs on.
const screenshotHtml = async (page: Page, width: number, height: number, html: string, omitBackground: boolean): Promise<Buffer> => {
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: 'load' });
  return page.screenshot({ omitBackground, animations: 'disabled' });
};

const iconHtml = (dataUri: string): string =>
  `<style>html,body{margin:0;background:transparent}img{display:block;width:100vw;height:100vh}</style><img src="${dataUri}" />`;

const splashHtml = (dataUri: string): string =>
  `<style>
    html,body{margin:0;height:100%;background:${argamanVeZahavColors.primary}}
    body{display:flex;align-items:center;justify-content:center}
    img{width:${SPLASH_MASTER_WIDTH_SHARE * 100}vw;height:auto}
  </style><img src="${dataUri}" />`;

const main = async (): Promise<void> => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 });

    for (const { master, outputPath, size } of ICON_JOBS) {
      writePng(outputPath, await screenshotHtml(page, size, size, iconHtml(readMasterAsDataUri(master)), true));
    }

    const splashMaster = readMasterAsDataUri(SPLASH_MASTER);
    for (const screen of SPLASH_SCREENS) {
      const { width, height } = splashImageSize(screen);
      writePng(splashImagePath(screen), await screenshotHtml(page, width, height, splashHtml(splashMaster), false));
    }
  } finally {
    await browser.close();
  }
};

main().catch((error: unknown) => {
  console.error('PWA rasterise failed', error);
  process.exitCode = 1;
});
