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

// Forces the test runner's own iframe to a given size for the duration of
// `play`, then restores it, so one story's resize never leaks into the
// next. `heightPx` is optional: a story that only needs to cross a width
// breakpoint leaves the runner's own height alone.
export const atFrameSize = async (widthPx: number, heightPx: number | undefined, play: () => Promise<void>): Promise<void> => {
  const frame = window.frameElement as HTMLIFrameElement | null;
  if (!frame) throw new Error('story: window.frameElement not found, expected to be running inside the test runner\'s iframe');

  const originalWidth = frame.style.width;
  const originalHeight = frame.style.height;
  frame.style.width = `${widthPx}px`;
  if (heightPx !== undefined) frame.style.height = `${heightPx}px`;
  await new Promise((resolve) => window.setTimeout(resolve, 100));

  try {
    await play();
  } finally {
    frame.style.width = originalWidth;
    if (heightPx !== undefined) frame.style.height = originalHeight;
  }
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
//
// The marker is a quiet neutral, not `color.danger` or anything close to it:
// an earlier, more saturated red read as an error badge sitting on top of
// every poster this fixture feeds (design gate round 6).
//
// The horizon only carries vertical position: under a horizontal drag it is
// identical at every offset, so a crop step story that pans sideways showed
// nothing moving inside the window unless the corner marker itself happened
// to be under it (design gate round 7). The centre stripe below is the
// vertical feature that makes horizontal movement visible; it stays the same
// quiet neutral tone as the marker for the same reason.
export const placeholderPhoto = (width: number, height: number): string => {
  const horizonY = Math.round(height * 0.6);
  const markerRadius = Math.max(10, Math.round(Math.min(width, height) * 0.08));
  const stripeWidth = Math.max(6, Math.round(width * 0.04));
  const stripeX = Math.round(width / 2 - stripeWidth / 2);

  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
        `<rect width="${width}" height="${horizonY}" fill="#cfd8dc"/>` +
        `<rect y="${horizonY}" width="${width}" height="${height - horizonY}" fill="#8d99a3"/>` +
        `<rect x="${stripeX}" y="0" width="${stripeWidth}" height="${height}" fill="#5a6670"/>` +
        `<circle cx="${markerRadius + 10}" cy="${markerRadius + 10}" r="${markerRadius}" fill="#5a6670"/>` +
        `</svg>`,
    )
  );
};

// The server derives a rabbi's and a place's slug from its display name the
// same way (`server/src/service/shared/slug.ts`), so both fixtures need it
// and neither owns it. Close enough for the plain, unvocalised Hebrew names
// these fixtures use: any run of characters that is not a letter or a digit
// becomes one hyphen, trimmed at the edges. The client never imports the
// real function, so this can still drift from what the server computes;
// nothing checks that it has not.
export const slugFromName = (name: string): string => name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
