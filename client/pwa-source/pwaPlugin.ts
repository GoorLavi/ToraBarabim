import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

import { MANIFEST_PATH, SERVICE_WORKER_MODE, SERVICE_WORKER_PATH } from '../src/pwa/consts.ts';
import {
  KILL_SWITCH_SOURCE_FILE,
  OFFLINE_PAGE_PUBLIC_PATH,
  SERVICE_WORKER_SOURCE_FILE,
  VERSION_LENGTH,
  VERSION_PLACEHOLDER,
} from './consts.ts';
import { buildManifest } from './manifest.ts';

const readSource = (fileName: string): string =>
  readFileSync(fileURLToPath(new URL(`./${fileName}`, import.meta.url)), 'utf-8');

// The version has to change whenever the worker's behaviour or anything it
// serves can change, and not otherwise: a version that changes every build
// reinstalls the worker for nothing, one that never changes strands visitors on
// a stale worker or offline page. Three inputs cover it. The worker's own
// source, because an edit to sw.js alone must still change the cache name.
// Hashed asset names, which already encode their content, so the sorted list of
// emitted names stands in for the bundle. The offline page, which lives in
// public/ that Vite copies after the bundle exists, so its bytes are read from
// disk. All three are deterministic, so two builds of the same tree agree.
const buildVersion = (workerSource: string, emittedFileNames: string[], offlinePageHtml: string): string => {
  const hash = createHash('sha256');
  hash.update(workerSource);
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
        this.emitFile({ type: 'asset', fileName: SERVICE_WORKER_PATH.slice(1), source: readSource(KILL_SWITCH_SOURCE_FILE) });
        return;
      }

      const offlinePagePath = path.join(publicDir, OFFLINE_PAGE_PUBLIC_PATH);
      if (!existsSync(offlinePagePath)) {
        this.error(`Expected ${offlinePagePath}: the worker precaches it, and without it the worker cannot install.`);
      }
      const offlinePageHtml = readFileSync(offlinePagePath, 'utf-8');

      const source = readSource(SERVICE_WORKER_SOURCE_FILE);
      if (!source.includes(VERSION_PLACEHOLDER)) {
        this.error(`Expected pwa-source/${SERVICE_WORKER_SOURCE_FILE} to contain ${VERSION_PLACEHOLDER}, found none: the worker would ship without a version.`);
      }
      const version = buildVersion(source, Object.keys(bundle), offlinePageHtml);

      this.emitFile({
        type: 'asset',
        fileName: SERVICE_WORKER_PATH.slice(1),
        source: source.replace(VERSION_PLACEHOLDER, version),
      });
    },
  };
};
