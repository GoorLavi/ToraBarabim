import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import type { CityDirectoryResponse } from '@torabarabim/common';
import type { FastifyInstance } from 'fastify';

import { HEALTH_RENDER_PROBE_PATH } from '../src/api/health/consts';

// Read-only: the one constant this suite needs from the client workspace, to
// assert a document's canonical against the same origin the route modules
// build it from rather than a second, hand-typed copy of the domain.
import { SITE_ORIGIN } from '../../client/consts';
import { assertClientBuilt, assertDatabaseReachable, buildApp, rawClient } from './app-harness';

const extractTitle = (html: string): string => {
  const match = /<title>([^<]*)<\/title>/.exec(html);
  assert.ok(match, 'expected the document to include a <title>');
  return match[1] ?? '';
};

const extractCanonical = (html: string): string => {
  const match = /<link rel="canonical" href="([^"]*)"/.exec(html);
  assert.ok(match, 'expected the document to include a canonical <link>');
  return match[1] ?? '';
};

describe('SSR rendering seam', () => {
  let app: FastifyInstance;

  before(async () => {
    await Promise.all([assertDatabaseReachable(), assertClientBuilt()]);
    // `buildApp` mounts the SSR plugin last, which this suite depends on
    // entirely: it is the catch-all route under test. A build that mounted a
    // health route without also mounting SSR is exactly how the health check
    // passed once for the wrong reason (see the `/health` suite below): the
    // probe path matched nothing, Fastify answered its own 404, and the check
    // never proved a render happened.
    app = await buildApp();
  });

  after(async () => {
    await app.close();
    await rawClient.end({ timeout: 5 });
  });

  describe('the static asset boundary', () => {
    // Regression test for the defect that broke client-side navigation in
    // production: STATIC_ASSET_PATTERN used to match anything with a file
    // extension, including React Router's own `*.data` single-fetch
    // requests, and served them (and their inevitable 404) from
    // @fastify/static instead of the document handler. `content-type:
    // text/x-script` only appears on a response the framework's own request
    // handler produced; a bare static-file 404 would answer JSON instead.
    test('a React Router .data request reaches the document handler, not the static file server', async () => {
      const rootData = await app.inject({ method: 'GET', url: '/_root.data' });
      assert.equal(rootData.statusCode, 200);
      assert.match(rootData.headers['content-type'] as string, /^text\/x-script/);

      const routeData = await app.inject({ method: 'GET', url: '/rabbis.data' });
      assert.equal(routeData.statusCode, 200);
      assert.match(routeData.headers['content-type'] as string, /^text\/x-script/);
    });

    // `sitemap.xml` was removed from STATIC_ASSET_PATTERN on purpose so this
    // resource route, built from the database on every request, could answer
    // it instead of a stale build-time file. Nothing stops someone adding it
    // back to the pattern, which would silently resurrect the stale file (or
    // a bare 404, since the server build no longer even contains one); this
    // is the regression test for that.
    test('sitemap.xml reaches the resource route with more than one URL', async () => {
      const res = await app.inject({ method: 'GET', url: '/sitemap.xml' });
      assert.equal(res.statusCode, 200);
      assert.match(res.headers['content-type'] as string, /xml/);

      const locCount = (res.body.match(/<loc>/g) ?? []).length;
      assert.ok(locCount > 1, `expected more than one <loc> in the sitemap, got ${locCount}`);
    });

    test('robots.txt is still served statically and disallows the admin and rabbi panels', async () => {
      const res = await app.inject({ method: 'GET', url: '/robots.txt' });
      assert.equal(res.statusCode, 200);
      assert.match(res.body, /Disallow: \/admin/);
      assert.match(res.body, /Disallow: \/rabbi/);
    });
  });

  describe('GET /health', () => {
    test('reports ok when the app is mounted the way production mounts it', async () => {
      const res = await app.inject({ method: 'GET', url: '/health' });
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.json(), { status: 'ok' });
    });

    // The health check's own logic only checks that the probe path answers
    // 404, and an unmounted SSR plugin would also answer 404 by Fastify's
    // own default, for a different reason. This asserts the thing that
    // actually distinguishes the two: a real render produces an HTML
    // document, never Fastify's default JSON 404 body.
    test('the render probe path is answered by a real render, not by Fastify\'s own default 404', async () => {
      const res = await app.inject({ method: 'GET', url: HEALTH_RENDER_PROBE_PATH });
      assert.equal(res.statusCode, 404);
      assert.match(res.headers['content-type'] as string, /text\/html/);
    });
  });

  describe('the canonical city URL', () => {
    // Derived from the database rather than a hardcoded seed city name: a
    // hardcoded local seed name is exactly what has already broken a suite
    // once. Any seeded city whose slug has more than one word exercises the
    // redirect, since replacing its hyphen with a space produces a
    // differently-formatted, non-canonical URL that still normalises
    // (city-detail.server.ts's toSlug) to the same canonical slug.
    test('a non-canonical slug redirects permanently to the canonical path, and the canonical path itself resolves', async () => {
      const directory = await app.inject({ method: 'GET', url: '/v1/cities/directory' });
      const body = directory.json() as CityDirectoryResponse;
      const city = body.areas.flatMap((area) => area.cities).find((candidate) => candidate.slug.includes('-'));
      assert.ok(city, 'expected at least one seeded city with a multi-word slug to exercise the redirect');

      const nonCanonicalSlug = (city as NonNullable<typeof city>).slug.replace(/-/g, ' ');
      const canonicalPath = `/cities/${encodeURIComponent((city as NonNullable<typeof city>).slug)}`;

      const redirect = await app.inject({ method: 'GET', url: `/cities/${encodeURIComponent(nonCanonicalSlug)}` });
      assert.equal(redirect.statusCode, 301);
      assert.equal(redirect.headers.location, canonicalPath);

      const canonical = await app.inject({ method: 'GET', url: canonicalPath });
      assert.equal(canonical.statusCode, 200);
    });
  });

  describe('the status code is the truth', () => {
    // Each case here also asserts Cache-Control: no-store. This is the
    // regression test for the defect where a loader's bare `throw new
    // Error()` carried no headers for `headers()`'s `errorHeaders` to read,
    // so a 500 from a database outage was cached at the edge as if it were a
    // normal page. Every loader in this app now throws a Response carrying
    // that header on every failure path, a 404 included, so the cheapest
    // honest way to exercise it is the same request that proves the status
    // code.
    test('an unknown city slug is a real 404, never cached', async () => {
      const res = await app.inject({ method: 'GET', url: `/cities/${encodeURIComponent('עיר-שלא-קיימת-לעולם')}` });
      assert.equal(res.statusCode, 404);
      assert.equal(res.headers['cache-control'], 'no-store');
    });

    test('an unknown area slug is a real 404, never cached', async () => {
      const res = await app.inject({ method: 'GET', url: '/areas/does-not-exist' });
      assert.equal(res.statusCode, 404);
      assert.equal(res.headers['cache-control'], 'no-store');
    });

    test('a lesson occurrence that does not exist is a real 404, never cached', async () => {
      const res = await app.inject({ method: 'GET', url: '/lesson/does-not-exist/2026-01-01' });
      assert.equal(res.statusCode, 404);
      assert.equal(res.headers['cache-control'], 'no-store');
    });
  });

  describe('per-page SEO', () => {
    test('the home page and the rabbis index carry distinct titles and distinct canonicals', async () => {
      const home = await app.inject({ method: 'GET', url: '/' });
      const rabbisIndex = await app.inject({ method: 'GET', url: '/rabbis' });
      assert.equal(home.statusCode, 200);
      assert.equal(rabbisIndex.statusCode, 200);

      const homeTitle = extractTitle(home.body);
      const rabbisTitle = extractTitle(rabbisIndex.body);
      assert.notEqual(homeTitle, rabbisTitle);

      const homeCanonical = extractCanonical(home.body);
      const rabbisCanonical = extractCanonical(rabbisIndex.body);
      assert.notEqual(homeCanonical, rabbisCanonical);
      assert.equal(homeCanonical, `${SITE_ORIGIN}/`);
      assert.equal(rabbisCanonical, `${SITE_ORIGIN}/rabbis`);
    });

    test('the admin and rabbi panels carry noindex, nofollow', async () => {
      const admin = await app.inject({ method: 'GET', url: '/admin' });
      const rabbiPanel = await app.inject({ method: 'GET', url: '/rabbi' });
      assert.match(admin.body, /<meta name="robots" content="noindex, nofollow"/);
      assert.match(rabbiPanel.body, /<meta name="robots" content="noindex, nofollow"/);
    });
  });
});
