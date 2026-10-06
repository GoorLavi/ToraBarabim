# 0053: The site runs a service worker that never caches lesson data

- **Status:** accepted
- **Date:** 2026-10-06
- **Decided by:** goorlavi

## Context

To make the site installable to the home screen, and to leave room for push
notifications later (iOS sends web push only to an installed site), the site needs a
manifest and a service worker. A service worker lives in the visitor's browser, not on
our servers: once installed it keeps running until a newer one replaces it, so a bad one
cannot be recalled by a deploy alone. And the product is lesson times; a stale time is
worse than none ([product.md](../product.md)).

## Decision

- **One hand-written worker at `/sw.js`, scope `/`**, emitted by the client build with a
  version stamped from the bundle, so every deploy installs a new one and deletes the old
  caches.
- **It caches only hashed `/assets/*` files and the static offline page.** It never
  caches a document, an API response, lesson data, a 5xx or a 403. Navigations go to the
  network, and the offline page is shown only when the network itself fails; an outage
  page or a geo-block passes through untouched. The panels and `/login` are never
  intercepted.
- **The site does not work offline.** It says so plainly on the offline page.
- **A kill switch exists:** a replacement worker that deletes its caches and unregisters
  itself. The emergency path and the durable path are in `infra/README.md`.
- **`sw.js` and the manifest are held at the edge for at most 60 seconds** and sent to
  browsers as `no-cache`, so a fix or the kill switch reaches visitors within a minute.

## Consequences

- Every full navigation pays the worker's start-up time.
- A worker bug reaches every returning visitor until the kill switch or a fix lands; the
  60-second edge policy is what bounds that.
- An emergency kill switch is overwritten by the next deploy unless the durable flip
  (`SERVICE_WORKER_MODE`) is merged first.
- The manifest `id` and the worker scope are now fixed. Changing either creates a new
  app identity and orphans existing installs, and phase 2 push depends on them.
- The deploy now sets headers per file and a missing offline page fails the client build.

## Rejected

- **Workbox:** a dependency for about fifty lines of logic, harder to audit.
- **Caching pages or lesson data for offline use:** would show times that may have
  changed.
- **A static, hand-versioned manifest and worker:** retyped colours and a version nobody
  remembers to bump, so old asset caches would never be cleared.
