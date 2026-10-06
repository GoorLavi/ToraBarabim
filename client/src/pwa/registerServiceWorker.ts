import { SERVICE_WORKER_MODE, SERVICE_WORKER_PATH, SERVICE_WORKER_SCOPE } from './consts';

// Production only: the dev server serves no /sw.js, and a worker cached in a
// developer's browser would outlive the branch that registered it.
// `updateViaCache: 'none'` makes the browser fetch /sw.js itself past its HTTP
// cache on every update check, so a new version or the kill switch is seen on
// the next navigation rather than after a cache entry expires.
export const registerServiceWorker = (): void => {
  if (!import.meta.env.PROD) return;
  if (SERVICE_WORKER_MODE === 'killSwitch') return;
  if (!('serviceWorker' in navigator)) return;

  const register = (): void => {
    navigator.serviceWorker
      .register(SERVICE_WORKER_PATH, { scope: SERVICE_WORKER_SCOPE, updateViaCache: 'none' })
      .catch((error: unknown) => {
        console.error(`Service worker registration failed for ${SERVICE_WORKER_PATH} at scope ${SERVICE_WORKER_SCOPE}`, error);
      });
  };

  // Waiting for `load` keeps the worker's install, which fetches the offline
  // page, from competing with the page's own first paint.
  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register, { once: true });
  }
};
