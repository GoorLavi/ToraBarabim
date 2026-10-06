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
import { SPLASH_SCREENS } from '../src/pwa/consts.ts';
import { splashImagePath, splashImageSize } from '../src/pwa/helpers.ts';
import { ICON_JOBS, MASTER_MIME_TYPES, SPLASH_MASTER } from './consts.ts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const mastersDirectory = path.resolve(process.argv[2] ?? path.join(scriptDirectory, 'masters'));
const publicDirectory = path.resolve(process.argv[3] ?? path.join(scriptDirectory, '../public'));

const readMasterAsDataUri = (fileName: string): string => {
  const masterPath = path.join(mastersDirectory, fileName);
  const mimeType = MASTER_MIME_TYPES[path.extname(fileName)];
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

// The master is scaled by device width / 430 and centred vertically on a field
// of the same argaman, so a device taller than the master gets an invisible gap
// and a shorter one loses an invisible band at the top and bottom. The field is
// the colour token, which is also the master's own background.
const splashHtml = (dataUri: string): string =>
  `<style>
    html,body{margin:0;height:100%;overflow:hidden;background:${argamanVeZahavColors.primary}}
    body{display:flex;align-items:center;justify-content:center}
    img{display:block;flex:none;width:100vw;height:auto}
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
