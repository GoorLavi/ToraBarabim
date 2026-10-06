import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

import { MANIFEST_PATH, SERVICE_WORKER_MODE, SERVICE_WORKER_PATH } from '../src/pwa/consts.ts';
import { buildManifest } from './manifest.ts';

const VERSION_PLACEHOLDER = '__BUILD_VERSION__';
const VERSION_LENGTH = 12;
const OFFLINE_PAGE_PUBLIC_PATH = 'pwa/offline.html';

const readSource = (fileName: string): string =>
  readFileSync(fileURLToPath(new URL(`./${fileName}`, import.meta.url)), 'utf-8');

// The version has to change exactly when the worker's behaviour or what it
// serves can change, and never otherwise: a version that changes every build
// reinstalls the worker for nothing, one that never changes strands visitors
// on a stale offline page. Hashed asset names already encode their content, so
// the sorted list of emitted names stands in for the bundle. The offline page
// lives in public/, which Vite copies after the bundle exists, so its bytes
// are read from disk.
const buildVersion = (emittedFileNames: string[], offlinePageHtml: string): string => {
  const hash = createHash('sha256');
  [...emittedFileNames].sort().forEach((fileName) => hash.update(`${fileName}\n`));
  hash.update(offlinePageHtml);
  return hash.digest('hex').slice(0, VERSION_LENGTH);
};

// Emits /sw.js and /manifest.webmanifest into the client build only: the
// server bundle has no use for either, and the manifest is generated here so
// its name, description and colours cannot drift from the site's own constants.
export const pwaFiles = (): Plugin => {
  let publicDir = '';

  return {
    name: 'pwa-files',
    applyToEnvironment: (environment) => environment.name === 'client',

    configResolved(config) {
      publicDir = config.publicDir;
    },

    // Without this the document's manifest link would 404 in development.
    configureServer(server) {
      server.middlewares.use(MANIFEST_PATH, (_request, response) => {
        response.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
        response.end(JSON.stringify(buildManifest()));
      });
    },

    generateBundle(_options, bundle) {
      this.emitFile({
        type: 'asset',
        fileName: MANIFEST_PATH.slice(1),
        source: JSON.stringify(buildManifest()),
      });

      if (SERVICE_WORKER_MODE === 'killSwitch') {
        this.emitFile({ type: 'asset', fileName: SERVICE_WORKER_PATH.slice(1), source: readSource('sw-kill-switch.js') });
        return;
      }

      const offlinePagePath = path.join(publicDir, OFFLINE_PAGE_PUBLIC_PATH);
      if (!existsSync(offlinePagePath)) {
        this.error(`Expected ${offlinePagePath}: the worker precaches it, and without it the worker cannot install.`);
      }
      const offlinePageHtml = readFileSync(offlinePagePath, 'utf-8');

      const source = readSource('sw.js');
      if (!source.includes(VERSION_PLACEHOLDER)) {
        this.error(`Expected pwa-source/sw.js to contain ${VERSION_PLACEHOLDER}, found none: the worker would ship without a version.`);
      }
      const version = buildVersion(Object.keys(bundle), offlinePageHtml);

      this.emitFile({
        type: 'asset',
        fileName: SERVICE_WORKER_PATH.slice(1),
        source: source.replace(VERSION_PLACEHOLDER, version),
      });
    },
  };
};
