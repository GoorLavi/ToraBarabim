import { PassThrough, Readable } from 'node:stream';

import { renderToPipeableStream } from 'react-dom/server';
import type { AppLoadContext, EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';
import { ServerStyleSheet } from 'styled-components';

// Generous: this only fires if a Suspense boundary never settles (a stuck
// deferred loader), not on the ordinary path.
const STREAM_ABORT_TIMEOUT_MS = 10_000;

// `ServerStyleSheet` is documented against `renderToString`; streaming needs
// its `interleaveWithNodeStream` path instead, which splices `<style>` tags
// into the raw HTML bytes as they are produced. Class names match on both
// sides because they are derived from render order and content, the same on
// the client, so there is no hydration mismatch to reconcile here.
export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext,
): Promise<Response> {
  return new Promise((resolve) => {
    const sheet = new ServerStyleSheet();

    const { pipe, abort } = renderToPipeableStream(
      sheet.collectStyles(<ServerRouter context={routerContext} url={request.url} />),
      {
        onShellReady() {
          responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
          // styled-components types this as the loose NodeJS.ReadWriteStream
          // interface, but it always hands back a real PassThrough at
          // runtime; the cast just restores the concrete type Readable.toWeb
          // needs.
          const body = sheet.interleaveWithNodeStream(pipe(new PassThrough())) as unknown as Readable;
          resolve(
            new Response(Readable.toWeb(body) as unknown as ReadableStream, {
              status: responseStatusCode,
              headers: responseHeaders,
            }),
          );
        },
        // Fails open: a shell-level failure means React could not produce
        // even the initial document, so no route's own ErrorBoundary ever
        // got a chance to run. Returning a hand-written, non-React page
        // trades away the app's styling for this one response, in exchange
        // for never sending back an empty body. Status 500 so it is never
        // cached or indexed.
        onShellError() {
          resolve(
            new Response(
              `<!doctype html>
<html lang="he" dir="rtl">
  <head><meta charset="utf-8" /><title>תורה ברבים</title></head>
  <body>
    <p>אירעה שגיאה בטעינת העמוד. אפשר <a href="/">לחזור לדף הבית</a> או לרענן.</p>
  </body>
</html>`,
              { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
            ),
          );
        },
        onError(error: unknown) {
          // The shell may already be streaming to the client by the time a
          // deferred chunk fails; there is nothing left to do but log it.
          console.error('SSR render error', error);
        },
      },
    );

    setTimeout(abort, STREAM_ABORT_TIMEOUT_MS);
  });
}
