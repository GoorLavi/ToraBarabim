// @ts-check
// Source of /sw.js. The Vite plugin (pwaPlugin.ts) stamps the version below
// from a hash of the client bundle and emits the result next to the build.
//
// What this worker does is deliberately small: it answers a navigation that
// failed at the network with a static offline page, and keeps the hashed build
// assets after the first fetch. It never stores a document, an API response or
// lesson data, because a cached lesson list would show a visitor last week's
// schedule as if it were tonight's.

/** @type {ServiceWorkerGlobalScope} */
// @ts-expect-error `self` is typed as Window in the DOM lib; this file is checked against the WebWorker lib.
const worker = self;

const BUILD_VERSION = '__BUILD_VERSION__';
const CACHE_NAME = `torabarabim-${BUILD_VERSION}`;

// Hand-mirrored from client/src/pwa/consts.ts (OFFLINE_PAGE_PATH). This file
// is not bundled, so it cannot import it. The service worker test in
// server/test/ssr.test.ts requests the path this file names and fails when it
// stops answering.
const OFFLINE_PAGE_PATH = '/pwa/offline.html';

// Hand-mirrored from client/src/routes.ts: the routes outside the public
// Layout. Matched on a path segment boundary, so /rabbis and /places (public)
// are not caught by /rabbi and /place. These stay network-only so an expired
// session or a signed-out panel is never answered with an offline page.
const APP_SURFACE_PREFIXES = ['/admin', '/rabbi', '/place', '/login'];

const ASSETS_PREFIX = '/assets/';

/** @param {string} pathname */
const isAppSurface = (pathname) =>
  APP_SURFACE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const precacheOfflinePage = async () => {
  const cache = await caches.open(CACHE_NAME);
  // `reload` skips the HTTP cache, so a new version never precaches the
  // previous version's offline page. `add` rejects on a non-2xx answer, which
  // fails the install: better no worker than one that cannot show its page.
  await cache.add(new Request(OFFLINE_PAGE_PATH, { cache: 'reload' }));
};

const deleteOtherVersions = async () => {
  const names = await caches.keys();
  await Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
};

/** @param {Request} request */
const navigateOrShowOfflinePage = async (request) => {
  try {
    // Any answer the network gives, a 503 outage page or a 403 geo-block
    // included, is passed through. Only a failed connection means offline.
    return await fetch(request);
  } catch {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(OFFLINE_PAGE_PATH)) ?? Response.error();
  }
};

/**
 * @param {Request} request
 * @param {ExtendableEvent} event
 */
const assetCacheFirst = async (request, event) => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  // Status 200 and `basic` only: a 206 partial or an opaque cross-origin
  // answer cannot be replayed to a later request for the whole file.
  if (response.status === 200 && response.type === 'basic') {
    event.waitUntil(
      cache.put(request, response.clone()).catch((error) => {
        console.error(`Service worker could not store ${request.url}`, error);
      }),
    );
  }
  return response;
};

worker.addEventListener('install', (event) => {
  event.waitUntil(precacheOfflinePage().then(() => worker.skipWaiting()));
});

worker.addEventListener('activate', (event) => {
  event.waitUntil(deleteOtherVersions().then(() => worker.clients.claim()));
});

worker.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== worker.location.origin) return;

  if (request.mode === 'navigate') {
    if (isAppSurface(url.pathname)) return;
    event.respondWith(navigateOrShowOfflinePage(request));
    return;
  }

  if (url.pathname.startsWith(ASSETS_PREFIX)) {
    event.respondWith(assetCacheFirst(request, event));
  }
});
