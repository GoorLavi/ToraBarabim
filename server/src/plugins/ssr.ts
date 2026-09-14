import path from 'node:path';
import { Readable } from 'node:stream';

import fastifyStatic from '@fastify/static';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createRequestHandler } from 'react-router';
import type { ServerBuild } from 'react-router';

// The client workspace's framework-mode build. Read-only from here: this
// plugin only ever imports the build output, never client source. Resolved
// from `__dirname` (this file compiles to CommonJS), which is `dist/plugins`
// once built, so three levels up is the repo root either way.
//
// Exported so `api/health` can check the same directory the SSR mount
// actually serves from, rather than a second `__dirname`-relative copy: two
// independent path calculations that happen to agree today would silently
// drift the moment the build layout moves, and a health check reading the
// wrong directory reports confidently either way.
export const CLIENT_BUILD_DIR = path.join(__dirname, '../../../client/build/client');
const SERVER_BUILD_PATH = path.join(__dirname, '../../../client/build/server/index.cjs');

// Covers the paths CloudFront serves from the S3 bucket instead of this
// server in production (infra/lib/site-stack.ts's `additionalBehaviors`):
// the hashed asset directory and the handful of named static files the
// client build emits (client/vite.config.ts's `seoFiles` plugin, and
// `client/public`). This fast path exists for local development and as
// defence in depth (0010); production traffic for these paths never reaches
// this server at all. A broader "anything with a file extension" pattern
// used to sit here and also matched React Router's own `*.data` single-fetch
// requests, 404ing them before they ever reached `createRequestHandler`.
// Anything not on this list, `.data` included, falls through to the handler
// below and gets a real 404 from the app instead of a bare one from the file
// server, which is also why `assets/.+` requires a filename rather than
// matching CloudFront's `assets/*` exactly: an empty `/assets/` has no real
// file behind it either way, and the app's own 404 is the better of the two
// bare ones to serve for it. `@fastify/static` is registered with
// `wildcard: false` so it does not also claim a catch-all route of its own,
// which would collide with the one below.
const STATIC_ASSET_PATTERN = /^\/(?:assets\/.+|favicon\.svg|robots\.txt|sitemap\.xml|outage\.html)$/;

// No official Fastify adapter exists for React Router 7 (only Express), so
// this hand-builds the Web Fetch `Request` the framework's own
// `createRequestHandler` expects from Fastify's Node request, then writes
// the resulting `Response` back onto the reply.
const toFetchRequest = (request: FastifyRequest): Request => {
  const url = `${request.protocol}://${request.headers.host ?? 'localhost'}${request.raw.url ?? '/'}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.append(key, value);
    }
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  return new Request(url, {
    method: request.method,
    headers,
    // `duplex: 'half'` is required by undici whenever `body` is a stream.
    ...(hasBody
      ? { body: Readable.toWeb(request.raw) as unknown as ReadableStream, duplex: 'half' as const }
      : {}),
  });
};

export const registerSsr = async (app: FastifyInstance): Promise<void> => {
  await app.register(fastifyStatic, {
    root: CLIENT_BUILD_DIR,
    prefix: '/',
    wildcard: false,
    // Hashed filenames are content-addressed and never reused, so caching
    // them forever is safe. In production this belongs on the CDN in front
    // of this container (0010), not here; see the SSR spike report.
    immutable: true,
    maxAge: '1y',
  });

  const getBuild = (): Promise<ServerBuild> => import(SERVER_BUILD_PATH) as Promise<ServerBuild>;
  const handleDocumentRequest = createRequestHandler(getBuild, process.env.NODE_ENV);

  const handleCatchAll = async (request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> => {
    const pathname = (request.raw.url ?? '/').split('?')[0] ?? '/';
    if ((request.method === 'GET' || request.method === 'HEAD') && STATIC_ASSET_PATTERN.test(pathname)) {
      return reply.sendFile(decodeURIComponent(pathname.replace(/^\//, '')));
    }

    const response = await handleDocumentRequest(toFetchRequest(request));

    reply.status(response.status);
    // `Headers.forEach` joins repeated headers with a comma, which corrupts
    // `Set-Cookie` (this app sets both an admin and a rabbi session cookie).
    // `getSetCookie()` recovers the individual values; Fastify sends an array
    // header value as one header line per entry rather than joining it.
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') return;
      reply.header(key, value);
    });
    const setCookies = response.headers.getSetCookie();
    if (setCookies.length > 0) {
      reply.header('set-cookie', setCookies);
    }

    if (!response.body) {
      return reply.send();
    }
    return reply.send(Readable.fromWeb(response.body as never));
  };

  // `.all()` registers every method fastify knows on this one wildcard
  // path, which collides twice with routes already registered elsewhere:
  // `exposeHeadRoute` (on by default) auto-adds HEAD for the GET already in
  // this list, and `@fastify/cors` already owns a global `OPTIONS *` for
  // preflight. Listing only the methods a document request actually uses,
  // with `exposeHeadRoute: false`, avoids both.
  app.route({
    method: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
    url: '/*',
    exposeHeadRoute: false,
    handler: handleCatchAll,
  });
};
