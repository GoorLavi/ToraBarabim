import { PassThrough, Readable, Transform } from 'node:stream';

import { renderToPipeableStream } from 'react-dom/server';
import type { AppLoadContext, EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';
import { ServerStyleSheet } from 'styled-components';

// Generous: this only fires if a Suspense boundary never settles (a stuck
// deferred loader), not on the ordinary path.
const STREAM_ABORT_TIMEOUT_MS = 10_000;

// react-dom-server prepends this literal to the very first bytes it writes
// whenever the rendered tree's root is `<html>` (see `doctypeChunk` in
// react-dom-server.node.development.js). `ServerStyleSheet.
// interleaveWithNodeStream` inspects each raw chunk and, unless it starts
// with a closing tag, prepends the collected `<style>` block to the front of
// it; the first chunk is the doctype glued to `<html ...>`, so the CSS lands
// ahead of the doctype and every page renders in quirks mode. There is no
// option on `ServerStyleSheet` to change where it inserts, so the doctype is
// pulled off the front of React's raw stream before it reaches the
// interleave step, and written back as the literal first bytes of the
// response. The `<style>` block then lands between the doctype and the real
// `<html ...>` tag; HTML5's tokenizer tolerates that (it synthesises an
// implied `<html>`/`<head>`, appends the style there, then merges the real
// tag's attributes onto that element), and the style tag is outside React's
// own tree either way, so this reordering has no bearing on hydration.
const DOCTYPE = '<!DOCTYPE html>';

// The two halves are one decision and have to agree: the doctype is written
// back at the front of the response only if it was actually taken off the
// front of React's stream. Writing it unconditionally would ship two of them
// on the day react-dom-server stops emitting it as the first chunk.
function moveDoctypeToTheFront(): { strip: Transform; prepend: Transform } {
  let stripped = false;
  let firstRawChunkSeen = false;
  let firstInterleavedChunkSeen = false;

  const strip = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      if (firstRawChunkSeen) {
        callback(null, chunk);
        return;
      }
      firstRawChunkSeen = true;
      const text = chunk.toString('utf-8');
      if (text.startsWith(DOCTYPE)) {
        stripped = true;
        callback(null, text.slice(DOCTYPE.length));
        return;
      }
      // Fails open: react-dom-server has always emitted the doctype as the
      // first chunk for an `<html>` root, but if that changes, pass the bytes
      // through untouched rather than corrupting them. The page then renders
      // in quirks mode again, so the line below is the only signal.
      console.error('SSR stream: expected the first chunk to start with the doctype, but it did not');
      callback(null, chunk);
    },
  });

  const prepend = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      if (firstInterleavedChunkSeen || !stripped) {
        callback(null, chunk);
        return;
      }
      firstInterleavedChunkSeen = true;
      callback(null, Buffer.concat([Buffer.from(DOCTYPE), chunk]));
    },
  });

  return { strip, prepend };
}

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
          const doctype = moveDoctypeToTheFront();
          const rawBody = pipe(new PassThrough()).pipe(doctype.strip);
          // styled-components types this as the loose NodeJS.ReadWriteStream
          // interface, but it always hands back a real PassThrough at
          // runtime; the cast just restores the concrete type Readable.toWeb
          // needs.
          const interleaved = sheet.interleaveWithNodeStream(rawBody) as unknown as Readable;

          const body = doctype.prepend;
          // `.pipe()` does not forward `error` events to its destination, so
          // a failure on the interleaved stream would otherwise hang the
          // response instead of surfacing.
          interleaved.on('error', (error) => body.destroy(error));
          interleaved.pipe(body);

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
