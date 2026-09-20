import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import type { CityDirectoryResponse, LessonOccurrence, LessonSearchResponse } from '@torabarabim/common';
import type { FastifyInstance } from 'fastify';

import { HEALTH_RENDER_PROBE_PATH } from '../src/api/health/consts';
import { buildRequestBody } from '../src/plugins/ssr';
import { addDays, nextDateOnWeekday, todayInIsrael } from '../src/service/lesson/israel-time';
import { toAreaSlug } from '../src/service/shared/consts';

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

const escapeForRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Matches the tag first and reads `content` out of it, rather than assuming
// `content` follows `property`: nothing in the rendering guarantees attribute
// order, so the stricter pattern would pass or fail on formatting.
const extractMetaProperty = (html: string, property: string): string => {
  const tag = new RegExp(`<meta[^>]*property="${escapeForRegExp(property)}"[^>]*>`).exec(html);
  assert.ok(tag, `expected the document to include a <meta property="${property}"> tag`);

  const content = /content="([^"]*)"/.exec(tag[0]);
  assert.ok(content, `expected the <meta property="${property}"> tag to carry a content attribute`);
  return content[1] ?? '';
};

// See public-api.test.ts's own comment: the seeded rabbanit, used here only
// to confirm the sitemap lists her page, not to assert anything about her
// lessons.
const SEEDED_RABBANIT_ID = 'rabbi-9';

// A weekly, Sunday-through-Thursday lesson; see
// `server/src/db/seed/lessons.ts`. Used here only to reach a real lesson
// page, not to assert anything about its recurrence.
const SEEDED_LESSON_ID = 'lesson-1';

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

  describe('the document shape', () => {
    // Regression test for quirks mode: styled-components' streaming
    // interleave prepends collected CSS to the front of React's first raw
    // chunk, which is the doctype glued to `<html ...>` by react-dom-server
    // itself. Without a fix, the doctype either lands after the `<style>`
    // block (quirks mode) or, from an earlier broken attempt at a fix, twice.
    test('a rendered page starts with exactly one doctype', async () => {
      const res = await app.inject({ method: 'GET', url: '/' });
      assert.equal(res.statusCode, 200);
      assert.match(res.body, /^<!doctype html>/i);

      const doctypeCount = (res.body.match(/<!doctype html>/gi) ?? []).length;
      assert.equal(doctypeCount, 1, `expected exactly one doctype, got ${doctypeCount}`);
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

  describe('a non-GET request through the SSR catch-all', () => {
    // Regression test for the production defect diagnosed from CloudWatch
    // (bursts of 500s since 17 September): `toFetchRequest` used to rebuild
    // the Fetch `Request` body by re-reading `request.raw`, but every content
    // type parser registered ahead of this catch-all (Fastify's built-in
    // JSON parser, and `empty-body.ts`'s `*` fallback) had already read that
    // stream to completion, so undici threw `Response body object should
    // not be disturbed or locked` before the request ever reached the
    // router. No route here exports an `action`, so once the request
    // actually reaches the router it answers a real 405, never a 500; that
    // is what these assert, for both a body shape the JSON parser never
    // touches and one it does.
    test('an empty body reaches the router as a 405, not a crash', async () => {
      const res = await app.inject({ method: 'POST', url: '/rabbis' });
      assert.equal(res.statusCode, 405);
    });

    test('a JSON body reaches the router as a 405, not a crash', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/rabbis',
        payload: JSON.stringify({ probe: true }),
        headers: { 'content-type': 'application/json' },
      });
      assert.equal(res.statusCode, 405);
    });
  });

  describe('the root-level error boundary', () => {
    // Regression test for a production 500 on every bot POST to an unmatched
    // path (e.g. /wp-login.php): that path matches only the catch-all route,
    // which has no action and no ErrorBoundary of its own, so the resulting
    // error bubbles past it to the root route. React Router then renders
    // root.tsx's Layout wrapping its ErrorBoundary in place of Layout's usual
    // child, the default-exported Root, which was the only place ThemeProvider
    // was mounted. Every styled-component in the error tree then read an
    // undefined theme and threw, turning the one screen meant to survive a
    // crash into a second crash: a bare 500 instead of this page.
    test('a POST matched only by the catch-all renders the themed error page instead of crashing', async () => {
      const res = await app.inject({ method: 'POST', url: '/wp-login.php' });
      assert.equal(res.statusCode, 405);
      assert.match(res.body, /משהו השתבש\. נסו לרענן את הדף\./);
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

    // Test 9 (plan, section 8): both women's-area routes render, each with
    // its own title and canonical, and /women's og:title matches plan
    // decision 8 exactly, not an approximation of it.
    test('/women and /women/rabbaniyot carry their own titles and canonicals, and /women carries decision 8\'s og:title exactly', async () => {
      const women = await app.inject({ method: 'GET', url: '/women' });
      const rabbaniyot = await app.inject({ method: 'GET', url: '/women/rabbaniyot' });
      assert.equal(women.statusCode, 200);
      assert.equal(rabbaniyot.statusCode, 200);

      const womenTitle = extractTitle(women.body);
      const rabbaniyotTitle = extractTitle(rabbaniyot.body);
      assert.notEqual(womenTitle, rabbaniyotTitle);

      const womenCanonical = extractCanonical(women.body);
      const rabbaniyotCanonical = extractCanonical(rabbaniyot.body);
      assert.notEqual(womenCanonical, rabbaniyotCanonical);
      assert.equal(womenCanonical, `${SITE_ORIGIN}/women`);
      assert.equal(rabbaniyotCanonical, `${SITE_ORIGIN}/women/rabbaniyot`);

      assert.equal(extractMetaProperty(women.body, 'og:title'), 'שיעורי תורה לנשים | תורה ברבים');
    });
  });

  describe("the lesson page's onward links", () => {
    // Test 2 of the plan: the rabbi link and the area link both exist in the
    // fully rendered document, never only after hydration, and the area
    // link resolves. The area preview itself is deferred behind Suspense,
    // but the rabbi link is not, so a full-body read is enough either way:
    // `app.inject` only resolves once the response has finished streaming,
    // so `page.body` here is always the complete document, not a partial
    // first chunk.
    test('the rendered lesson page links to the rabbi and to the area, and the area link resolves', async () => {
      const date = nextDateOnWeekday(todayInIsrael(new Date()), 0);
      const occurrenceRes = await app.inject({
        method: 'GET',
        url: `/v1/lessons/${SEEDED_LESSON_ID}/occurrences/${date}`,
      });
      assert.equal(occurrenceRes.statusCode, 200);
      const occurrence = occurrenceRes.json() as LessonOccurrence;

      const rabbiHref = `/rabbis/${encodeURIComponent(occurrence.rabbi.id)}/${encodeURIComponent(occurrence.rabbi.slug)}`;
      const areaHref = `/areas/${encodeURIComponent(toAreaSlug(occurrence.place.area))}`;

      // The area link in the rendered document only exists because the area
      // preview resolves to a non-empty list: it renders one `AreaLink` per
      // preview card, and the preview excludes `SEEDED_LESSON_ID` itself. If
      // the seed ever leaves this lesson as the only one in its area, that
      // link disappears and the assertion below would fail pointing at the
      // rabbi-link/area-link feature rather than at the seed. Confirm the
      // precondition explicitly first, so a seed change fails here instead.
      const from = todayInIsrael(new Date());
      const areaLessonsRes = await app.inject({
        method: 'GET',
        url: `/v1/lessons?area=${occurrence.place.area}&from=${from}&to=${addDays(from, 13)}&pageSize=50`,
      });
      assert.equal(areaLessonsRes.statusCode, 200);
      const areaLessons = areaLessonsRes.json() as LessonSearchResponse;
      assert.ok(
        areaLessons.items.some((item) => item.lessonId !== SEEDED_LESSON_ID),
        `expected another lesson in area "${occurrence.place.area}" besides ${SEEDED_LESSON_ID} for the area preview to be non-empty`,
      );

      const page = await app.inject({ method: 'GET', url: `/lesson/${SEEDED_LESSON_ID}/${date}` });
      assert.equal(page.statusCode, 200);
      assert.ok(page.body.includes(`href="${rabbiHref}"`), `expected the document to link to ${rabbiHref}`);
      assert.ok(page.body.includes(`href="${areaHref}"`), `expected the document to link to ${areaHref}`);

      const areaPage = await app.inject({ method: 'GET', url: areaHref });
      assert.equal(areaPage.statusCode, 200);
    });
  });

  describe('the sitemap', () => {
    // Test 10 (plan, section 8): both new pages and the seeded rabbanit's
    // own page are reachable through the sitemap, proving the two scoped
    // `rabbiService.list` calls in sitemap.server.ts both feed it.
    test('the sitemap contains /women, /women/rabbaniyot and the seeded rabbanit\'s page', async () => {
      const res = await app.inject({ method: 'GET', url: '/sitemap.xml' });
      assert.equal(res.statusCode, 200);
      assert.match(res.body, /<loc>[^<]*\/women<\/loc>/);
      assert.match(res.body, /<loc>[^<]*\/women\/rabbaniyot<\/loc>/);
      assert.match(res.body, new RegExp(`<loc>[^<]*/rabbis/${SEEDED_RABBANIT_ID}/[^<]*</loc>`));
    });
  });
});

// Exercised directly rather than through `app.inject`: no route in the client
// build exports an `action`, so a body forwarded through the catch-all is
// never read back, and a test driving the app could only ever assert the 405
// the suite above already covers. It needs neither the database nor the
// client build, so it sits outside that suite's `before`.
describe('the SSR catch-all request body', () => {
  test('a parsed JSON body is serialized again as JSON', () => {
    assert.deepEqual(buildRequestBody({ probe: true }, 'application/json; charset=utf-8'), {
      content: '{"probe":true}',
      contentType: 'application/json',
    });
  });

  // A JSON body of `"hello"` parses to the same string a `text/plain` body
  // of hello does, which is why the content type, not `typeof`, picks the
  // branch. Forwarding this one unquoted would not be valid JSON.
  test('a JSON body that is a bare string keeps its quotes', () => {
    assert.deepEqual(buildRequestBody('hello', 'application/json'), { content: '"hello"', contentType: 'application/json' });
  });

  test('a text/plain body is forwarded unchanged under its own type', () => {
    assert.deepEqual(buildRequestBody('hello', 'text/plain; charset=utf-8'), { content: 'hello', contentType: 'text/plain; charset=utf-8' });
  });

  test('a request with no body forwards none', () => {
    assert.equal(buildRequestBody(undefined, undefined), undefined);
  });
});
