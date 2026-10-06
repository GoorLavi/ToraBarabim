import { userEvent } from 'storybook/test';

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

// A real, decodable image file, generated at runtime so a story never
// depends on a remote host: `width` by `height`, lifted from
// `PhotoPicker.stories.tsx` once `CourseFormPage.stories.tsx` became a
// second caller.
//
// Rasterized to a PNG rather than handed over as the SVG `placeholderPhoto`
// itself draws: every real file input this app has carries
// `accept="image/jpeg,image/png"`, which `userEvent.upload` honours by
// silently dropping a file whose type does not match, leaving the input's
// `files` empty and any play step that depends on it stuck (design gate,
// PhotoPicker.stories.tsx round 7). Drawing the SVG into a canvas keeps
// `placeholderPhoto` the one source for the generated image's content while
// still producing a type a picker actually accepts.
export const generatedImageFile = async (width: number, height: number): Promise<File> => {
  const image = new Image();
  image.src = placeholderPhoto(width, height);
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`generatedImageFile: failed to decode the placeholder image at ${width}x${height}`));
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('generatedImageFile: canvas 2d context unavailable while rasterizing the placeholder image');
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error(`generatedImageFile: canvas failed to produce a png blob at ${width}x${height}`);

  return new File([blob], 'photo.png', { type: 'image/png' });
};

// Uploads a real generated file into a specific file input and confirms it
// actually arrived, rather than assuming `userEvent.upload` succeeded:
// lifted from `PhotoPicker.stories.tsx`'s own `selectGeneratedFile`, which
// only ever queried the sole file input on its page and could not tell two
// apart once `CourseFormPage.stories.tsx` (cover and gallery, two inputs on
// one screen) became a second caller.
//
// A file the `accept` filter rejects never fires `change` at all, so a
// picker's own handler silently does nothing (design gate round 7, on this
// exact helper). Reading `input.files` after `userEvent.upload` settles is
// too late to catch that: a picker's own `handleChange` resets
// `event.target.value` (and with it `.files`) as its first line, so a
// straight post-await check reports empty even on a real upload. Capturing
// `files.length` on the `change` event itself, before that handler runs, is
// the assertion that actually tells the two apart.
export const uploadGeneratedFileToInput = async (input: HTMLInputElement, width: number, height: number): Promise<void> => {
  let receivedFileCount: number | undefined;
  const captureFileCount = (event: Event): void => {
    receivedFileCount = (event.target as HTMLInputElement).files?.length ?? 0;
  };
  input.addEventListener('change', captureFileCount, { capture: true, once: true });

  const file = await generatedImageFile(width, height);
  await userEvent.upload(input, file);
  input.removeEventListener('change', captureFileCount, { capture: true });

  if (receivedFileCount !== 1) {
    throw new Error(
      `uploadGeneratedFileToInput: file input did not receive the generated ${width}x${height} file (accept="${input.accept}"): ${
        receivedFileCount === undefined ? 'no change event fired' : `${receivedFileCount} files`
      }`,
    );
  }
};

// The server derives a rabbi's and a place's slug from its display name the
// same way (`server/src/service/shared/slug.ts`), so both fixtures need it
// and neither owns it. Close enough for the plain, unvocalised Hebrew names
// these fixtures use: any run of characters that is not a letter or a digit
// becomes one hyphen, trimmed at the edges. The client never imports the
// real function, so this can still drift from what the server computes;
// nothing checks that it has not.
export const slugFromName = (name: string): string => name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');

// Computed against today, not a fixed date that will quietly move to the
// other side of it: a closed-course fixture's own dates (`leavesListsOn`,
// `closedOn`) read against `courseStillListed`'s own "is this still ahead
// of today" check (`~/helpers.ts`), so a hardcoded date eventually flips
// which side of it a story is actually testing. Lifted here once a second
// panel's own course stories needed it.
export const isoDateOffsetByDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

// Words that would make a promise or mention money: the visitor message
// window carries neither, anywhere, whoever opens it (decision 0039).
export const FORBIDDEN_WINDOW_COPY = /נחזור|ניצור קשר|נפנה|ניצור איתך|₪|עלות|מחיר|תשלום|ש"ח/;
