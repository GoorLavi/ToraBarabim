// Shared support for every Storybook story that answers this app's own
// fetch calls: Storybook's preview server has no live API behind it (unlike
// the app itself, which vite.config.ts proxies to the real API in dev), so
// every route a story's page calls has to be answered here instead.
//
// `installMockFetch` chains onto whatever `window.fetch` already is, so
// several story files can each install a mock in any load order without
// clobbering each other: a handler that does not recognise a URL returns
// `null` and falls through to whatever was there before. Its return value
// restores the previous `fetch`, for a caller (`LoginPage.stories.tsx`) that
// needs to undo the mock between stories via a `beforeEach` hook; a caller
// that installs one mock for the whole file, as most do, can simply ignore
// the return value.
export const installMockFetch = (respond: (url: URL) => Response | Promise<Response> | null): (() => void) => {
  const previousFetch = window.fetch;
  window.fetch = (async (input, init) => {
    const url = input instanceof Request ? new URL(input.url) : new URL(input.toString(), window.location.origin);
    const result = respond(url);
    if (result) return result;
    return previousFetch(input, init);
  }) as typeof fetch;
  return () => {
    window.fetch = previousFetch;
  };
};

export const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

// A fetch that never settles, for a story that shows a screen's loading
// state.
export const NEVER_RESOLVES = new Promise<Response>(() => {});

// A stand-in photo for any story whose screen shows one. Inline rather than
// a remote host: an external image URL does not resolve in the design
// gate's environment, so a with-photo story rendered as its own missing
// state and went unjudged (design gate finding, on two story files that
// each pointed at picsum.photos).
//
// Carries a horizon (a two-tone split, roughly where a facade photo's roofline
// sits) and a marked corner (a small circle), so a story can be judged on
// orientation and position rather than rendering as a flat rectangle no
// matter which part of it is on screen. A flat grey fill here previously made
// every PhotoCropStep story pixel-identical regardless of source shape or pan
// position, so the design gate had to inject its own content-bearing image to
// review framing at all (design gate finding, "two smaller things"). Still
// generic enough to read as a plain placeholder everywhere else this is used
// (a rabbi portrait, a place hero), not a real picture.
export const placeholderPhoto = (width: number, height: number): string => {
  const horizonY = Math.round(height * 0.6);
  const markerRadius = Math.max(10, Math.round(Math.min(width, height) * 0.08));

  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
        `<rect width="${width}" height="${horizonY}" fill="#cfd8dc"/>` +
        `<rect y="${horizonY}" width="${width}" height="${height - horizonY}" fill="#8d99a3"/>` +
        `<circle cx="${markerRadius + 10}" cy="${markerRadius + 10}" r="${markerRadius}" fill="#c0392b"/>` +
        `</svg>`,
    )
  );
};
