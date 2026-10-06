// @ts-check
// Replaces sw.js when the worker has to go. A browser that holds the normal
// worker re-fetches /sw.js on its next navigation, sees different bytes, and
// installs this one in its place: it deletes every cache, unregisters itself,
// and reloads each open page so the page stops being controlled.
//
// Two ways to ship it. Durable: set SERVICE_WORKER_MODE to 'killSwitch' in
// client/src/pwa/consts.ts and deploy. Emergency, without a deploy: the
// copy-and-invalidate commands in infra/README.md.

/** @type {ServiceWorkerGlobalScope} */
// @ts-expect-error The WebWorker lib types `self` as WorkerGlobalScope, which does not narrow to ServiceWorkerGlobalScope on its own.
const worker = self;

const retireWorker = async () => {
  const names = await caches.keys();
  await Promise.all(names.map((name) => caches.delete(name)));

  const windows = await worker.clients.matchAll({ type: 'window', includeUncontrolled: true });
  await worker.registration.unregister();

  await Promise.all(
    windows.map((windowClient) =>
      windowClient.navigate(windowClient.url).catch((error) => {
        console.error(`Kill switch could not reload ${windowClient.url}`, error);
      }),
    ),
  );
};

worker.addEventListener('install', (event) => {
  event.waitUntil(worker.skipWaiting());
});

worker.addEventListener('activate', (event) => {
  event.waitUntil(retireWorker());
});
