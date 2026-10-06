import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import type { CityDirectoryResponse, LessonOccurrence, LessonSearchResponse, RabbiHonorific } from '@torabarabim/common';
import rateLimit from '@fastify/rate-limit';
import { inArray } from 'drizzle-orm';
import Fastify, { type FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';

import { HEALTH_RENDER_PROBE_PATH } from '../src/api/health/consts';
import { db } from '../src/db/client';
import { cities, lessonExceptions, lessons, places, rabbis } from '../src/db/schema';
import { registerErrorHandler } from '../src/plugins/error-handler';
import { CALENDAR_RATE_LIMIT_MAX } from '../src/plugins/consts';
import { buildRequestBody, registerSsr } from '../src/plugins/ssr';
import * as courseService from '../src/service/course/course';
import { CALENDAR_HORIZON_DAYS } from '../src/service/lesson/consts';
import { addDays, nextDateOnWeekday, todayInIsrael } from '../src/service/lesson/israel-time';
import * as placeService from '../src/service/place/place';
import { toAreaSlug } from '../src/service/shared/consts';
import { toSlug } from '../src/service/shared/slug';
import storage from '../src/storage/storage';

// Read-only: the two things this suite needs from the client workspace, so
// its own assertions run the site's real conversion logic (the origin a
// document's canonical is built from, the honorific a rabbi's name is
// composed with) rather than a second, hand-typed copy of the domain.
import { SITE_ORIGIN } from '../../client/consts';
import { israelDateTime, lessonPath, rabbiDisplayName } from '../../client/src/helpers';
import { calendarUtcStamp } from '../../client/src/lessonCalendar/helpers';
import { CALENDAR_SITE_HOST, STATIC_EVENT_DISCLAIMER } from '../../client/src/lessonCalendar/consts';
import type { CalendarEvent } from '../../client/src/lessonCalendar/models';
import { CALENDAR_CACHE_HEADERS } from '../../client/src/routes/consts';
import { escapeIcsText, foldIcsLine, serializeCalendar } from '../../client/src/routes/ics.server';
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

// A page carries root.tsx's site-wide `WebSite` block as well as its own
// structured data, so this picks by `@type` rather than taking the first
// block it finds. Tolerates other attributes on the tag for the same reason
// `extractMetaProperty` below does: nothing in the rendering guarantees the
// tag carries `type` and nothing else, so a stricter pattern would fail on
// an added `nonce` while the JSON-LD itself was perfectly valid.
const extractJsonLd = (html: string, type: string): Record<string, unknown> => {
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(
    (match) => JSON.parse(match[1] ?? '{}') as Record<string, unknown>,
  );

  const block = blocks.find((candidate) => candidate['@type'] === type);
  assert.ok(block, `expected the document to include a ${type} JSON-LD block`);
  return block;
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

    // Regression test for Bing showing a generic globe: both paths used to
    // answer the app's HTML 404 because no such file was shipped.
    test('favicon.ico and apple-touch-icon.png are served as images, not the app\'s HTML 404', async () => {
      for (const url of ['/favicon.ico', '/apple-touch-icon.png']) {
        const res = await app.inject({ method: 'GET', url });
        assert.equal(res.statusCode, 200, `expected ${url} to be served, got ${res.statusCode}`);
        assert.match(res.headers['content-type'] as string, /^image\//, `expected ${url} to be an image`);
      }
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

    // Past dates stay reachable for the days the recurrence produces, so the
    // only thing keeping junk past URLs out of the index is that a date the
    // lesson never had is a 404. SEEDED_LESSON_ID has no Saturday lesson.
    test('a past date the lesson never had is a real 404, never cached', async () => {
      const lastSaturday = addDays(nextDateOnWeekday(todayInIsrael(new Date()), 6), -7);
      const res = await app.inject({ method: 'GET', url: `/lesson/${SEEDED_LESSON_ID}/${lastSaturday}` });
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

    // Search Console reported all four of these missing on 2026-09-19. They
    // are what makes a lesson eligible for an Event rich result, and nothing
    // on the page shows whether they are there, so a regression would
    // surface only weeks later in another Search Console report.
    test("the lesson page's Event data carries a description, an organizer and a free offer", async () => {
      const date = nextDateOnWeekday(todayInIsrael(new Date()), 0);
      const page = await app.inject({ method: 'GET', url: `/lesson/${SEEDED_LESSON_ID}/${date}` });
      assert.equal(page.statusCode, 200);

      assert.doesNotMatch(page.body, /<meta name="robots"/, 'a live lesson page must stay indexable');

      const event = extractJsonLd(page.body, 'Event');
      assert.ok(event['description'], 'expected the Event to carry a description');

      const organizer = event['organizer'] as Record<string, unknown> | undefined;
      assert.equal(organizer?.['@type'], 'Organization');
      assert.ok(organizer?.['name'], 'expected the Event\'s organizer to be named');

      const offers = event['offers'] as Record<string, unknown> | undefined;
      assert.equal(offers?.['@type'], 'Offer');
      assert.equal(offers?.['price'], 0);
      assert.equal(offers?.['priceCurrency'], 'ILS');

      // The Event's `image` and the performer's portrait are the same photo,
      // so assert that they agree rather than that either exists: CI seeds
      // without portraits (`db:seed:no-photos`) while production has them,
      // and a presence assertion would only hold in one of the two.
      const performer = event['performer'] as Record<string, unknown> | undefined;
      assert.equal(event['image'], performer?.['image']);
    });

    // A date before today stays reachable but must leave the index, and its
    // Event block would advertise a scheduled event that is already over.
    test('a lesson page for a date that already passed is noindexed, carries no Event, and keeps its own canonical', async () => {
      const lastSunday = addDays(nextDateOnWeekday(todayInIsrael(new Date()), 0), -7);
      const page = await app.inject({ method: 'GET', url: `/lesson/${SEEDED_LESSON_ID}/${lastSunday}` });
      assert.equal(page.statusCode, 200);

      assert.match(page.body, /<meta name="robots" content="noindex"/);
      assert.doesNotMatch(page.body, /"@type":\s*"Event"/);
      assert.equal(extractCanonical(page.body), `${SITE_ORIGIN}${lessonPath({ lessonId: SEEDED_LESSON_ID, date: lastSunday })}`);
    });
  });

  describe("the lesson page's onward links", () => {
    // Test 2 of the plan: the rabbi link and the area link both exist in the
    // fully rendered document, never only after hydration, and the area
    // link resolves. Both rails are deferred behind Suspense, but their
    // heading links are not, so a full-body read is enough either way:
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
      const areaHref = `/areas/${encodeURIComponent(toAreaSlug(occurrence.venue.area))}`;

      // The area link is the area rail's heading, so it is in the document
      // whether the rail is loading, empty or full. The precondition below is
      // therefore not about the link: it keeps the area page the link points
      // at a real, non-empty one, so the final resolve check proves something.
      const from = todayInIsrael(new Date());
      const areaLessonsRes = await app.inject({
        method: 'GET',
        url: `/v1/lessons?area=${occurrence.venue.area}&from=${from}&to=${addDays(from, 13)}&pageSize=50`,
      });
      assert.equal(areaLessonsRes.statusCode, 200);
      const areaLessons = areaLessonsRes.json() as LessonSearchResponse;
      assert.ok(
        areaLessons.items.length > 0,
        `expected at least one lesson in area "${occurrence.venue.area}" for the area page to be non-empty`,
      );

      const page = await app.inject({ method: 'GET', url: `/lesson/${SEEDED_LESSON_ID}/${date}` });
      assert.equal(page.statusCode, 200);
      assert.ok(page.body.includes(`href="${rabbiHref}"`), `expected the document to link to ${rabbiHref}`);
      assert.ok(page.body.includes(`href="${areaHref}"`), `expected the document to link to ${areaHref}`);

      const areaPage = await app.inject({ method: 'GET', url: areaHref });
      assert.equal(areaPage.statusCode, 200);
    });

    // The rabbi row is deferred, so a loader that never started it would
    // still render a page that looks complete. The next date is read from
    // the public API, not computed here, so the test follows the service's
    // own idea of "next scheduled".
    test("a past lesson page links the same lesson's next date", async () => {
      const lastSunday = addDays(nextDateOnWeekday(todayInIsrael(new Date()), 0), -7);
      const occurrenceRes = await app.inject({
        method: 'GET',
        url: `/v1/lessons/${SEEDED_LESSON_ID}/occurrences/${lastSunday}`,
      });
      assert.equal(occurrenceRes.statusCode, 200);
      const { rabbi } = occurrenceRes.json() as LessonOccurrence;

      const searchRes = await app.inject({ method: 'GET', url: `/v1/lessons?rabbiId=${encodeURIComponent(rabbi.id)}` });
      assert.equal(searchRes.statusCode, 200);
      const next = (searchRes.json() as LessonSearchResponse).items.find(
        (item) => item.lessonId === SEEDED_LESSON_ID && item.status === 'scheduled',
      );
      assert.ok(next, `expected an upcoming scheduled date of ${SEEDED_LESSON_ID}`);

      const page = await app.inject({ method: 'GET', url: `/lesson/${SEEDED_LESSON_ID}/${lastSunday}` });
      assert.equal(page.statusCode, 200);
      const nextHref = lessonPath(next);
      assert.ok(page.body.includes(`href="${nextHref}"`), `expected the document to link to ${nextHref}`);
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

  // The 5 seam cases from the plan, section 8: every case here exercises a
  // document route or the sitemap resource route, which call
  // `courseService` in-process, the same way the rabbi and place document
  // routes call their own services. Fixtures are inserted with `rawClient`
  // and removed in `after`, mirroring `course-api.test.ts`'s own approach,
  // since this suite has no write route to create them through.
  describe('the course page and its onward links', () => {
    const today = todayInIsrael(new Date());

    let rabbiId: string;
    let rabbiName: string;
    let rabbiHonorific: RabbiHonorific;
    let cityCode: number;

    const linkedCourseId = 'ssr-test-course-linked';
    const unlinkedCourseId = 'ssr-test-course-unlinked';
    const closedWithinWeekCourseId = 'ssr-test-course-closed-within-week';
    const closedPastWeekCourseId = 'ssr-test-course-closed-past-week';
    const allTestCourseIds = [linkedCourseId, unlinkedCourseId, closedWithinWeekCourseId, closedPastWeekCourseId];

    const insertTestCourse = (
      id: string,
      fields: { name: string; openingDate: string; weeks: number; joinableAfterOpening: boolean; rabbiId?: string; teacherName?: string; cycle?: number },
    ) =>
      rawClient`
        insert into courses (
          id, name, cycle, description, rabbi_id, teacher_name, opening_date, weeks, sessions,
          address_name, address_street, city_code, audience, joinable_after_opening,
          contact_phone, cover_key
        ) values (
          ${id}, ${fields.name}, ${fields.cycle ?? null}, 'תיאור לבדיקת רינדור',
          ${fields.rabbiId ?? null}, ${fields.teacherName ?? null},
          ${fields.openingDate}, ${fields.weeks}, 4,
          'בית מדרש לבדיקה', 'רחוב הבדיקה 1', ${cityCode}, 'men', ${fields.joinableAfterOpening},
          '0501234567', ${`courses/ssr-test/${id}.jpg`}
        )
      `;

    before(async () => {
      const [rabbiRow] = await rawClient`select id, name, honorific from rabbis where honorific = 'rav' limit 1`;
      const [cityRow] = await rawClient`select code from cities limit 1`;
      assert.ok(rabbiRow, 'expected at least one seeded rav to link the test course to');
      assert.ok(cityRow, 'expected at least one seeded city to address the test courses in');
      rabbiId = rabbiRow.id as string;
      rabbiName = rabbiRow.name as string;
      rabbiHonorific = rabbiRow.honorific as RabbiHonorific;
      cityCode = cityRow.code as number;

      await Promise.all([
        // Joinable, opened yesterday, 52 weeks: far from auto-closing, so
        // `open` today. Carries a cycle to exercise the title.
        insertTestCourse(linkedCourseId, {
          name: 'קורס לבדיקת רינדור, מקושר',
          openingDate: addDays(today, -1),
          weeks: 52,
          joinableAfterOpening: true,
          rabbiId,
          cycle: 3,
        }),
        insertTestCourse(unlinkedCourseId, {
          name: 'קורס לבדיקת רינדור, ללא רב מקושר',
          openingDate: addDays(today, -1),
          weeks: 52,
          joinableAfterOpening: true,
          teacherName: 'ישיבת דוגמה לבדיקה',
        }),
        // Non-joinable, opened 3 days ago: closes on its own opening day, so
        // closed since day -3, still inside the 7-day listed window.
        insertTestCourse(closedWithinWeekCourseId, {
          name: 'קורס לבדיקה, נסגר השבוע',
          openingDate: addDays(today, -3),
          weeks: 4,
          joinableAfterOpening: false,
          teacherName: 'ישיבת דוגמה לבדיקה',
        }),
        // Same shape, opened 10 days ago: closed since day -10, past the
        // 7-day listed window, but still published and reachable by link.
        insertTestCourse(closedPastWeekCourseId, {
          name: 'קורס לבדיקה, ירד מהרשימות',
          openingDate: addDays(today, -10),
          weeks: 4,
          joinableAfterOpening: false,
          teacherName: 'ישיבת דוגמה לבדיקה',
        }),
      ]);
    });

    after(async () => {
      await Promise.all(allTestCourseIds.map((id) => rawClient`delete from courses where id = ${id}`));
    });

    // Test 1 (plan, section 8): the 301, the canonical page's own title
    // (carrying the cycle), canonical, cover og:image and Course JSON-LD,
    // and that the JSON-LD provider is read from the right teacher shape for
    // both a linked and an unlinked course.
    test('a course URL without a slug redirects to its canonical path, which carries its own title, canonical, cover og:image and Course JSON-LD', async () => {
      const detail = await courseService.getPublicById(linkedCourseId, new Date());
      const canonicalPath = `/courses/${encodeURIComponent(detail.id)}/${encodeURIComponent(detail.slug)}`;

      const redirectRes = await app.inject({ method: 'GET', url: `/courses/${encodeURIComponent(linkedCourseId)}` });
      assert.equal(redirectRes.statusCode, 301);
      assert.equal(redirectRes.headers.location, canonicalPath);
      assert.match(redirectRes.headers['cache-control'] as string, /public/);

      const page = await app.inject({ method: 'GET', url: canonicalPath });
      assert.equal(page.statusCode, 200);
      assert.match(extractTitle(page.body), /מחזור 3/);
      assert.equal(extractCanonical(page.body), `${SITE_ORIGIN}${canonicalPath}`);
      assert.equal(extractMetaProperty(page.body, 'og:image'), storage.publicUrl(detail.coverKey));

      const linkedJsonLd = extractJsonLd(page.body, 'Course');
      assert.equal(linkedJsonLd['name'], detail.name);
      assert.equal(linkedJsonLd['image'], storage.publicUrl(detail.coverKey));
      const linkedProvider = linkedJsonLd['provider'] as Record<string, unknown> | undefined;
      assert.equal(linkedProvider?.['@type'], 'Person');
      assert.equal(linkedProvider?.['name'], rabbiDisplayName({ name: rabbiName, honorific: rabbiHonorific }));

      const unlinkedDetail = await courseService.getPublicById(unlinkedCourseId, new Date());
      const unlinkedPath = `/courses/${encodeURIComponent(unlinkedDetail.id)}/${encodeURIComponent(unlinkedDetail.slug)}`;
      const unlinkedPage = await app.inject({ method: 'GET', url: unlinkedPath });
      assert.equal(unlinkedPage.statusCode, 200);
      const unlinkedProvider = extractJsonLd(unlinkedPage.body, 'Course')['provider'] as Record<string, unknown> | undefined;
      assert.equal(unlinkedProvider?.['name'], 'ישיבת דוגמה לבדיקה');
    });

    // Test 2 (plan, section 8).
    test('an unknown course id is a real 404, never cached', async () => {
      const res = await app.inject({ method: 'GET', url: '/courses/does-not-exist' });
      assert.equal(res.statusCode, 404);
      assert.equal(res.headers['cache-control'], 'no-store');
    });

    // Test 3 (plan, section 8): a closed course carries noindex whether it
    // is still inside its listed week or already past it, and an open
    // course carries none.
    test('a closed course carries noindex in and past its listed week; an open course carries none', async () => {
      for (const id of [closedWithinWeekCourseId, closedPastWeekCourseId]) {
        const detail = await courseService.getPublicById(id, new Date());
        const canonicalPath = `/courses/${encodeURIComponent(detail.id)}/${encodeURIComponent(detail.slug)}`;
        const page = await app.inject({ method: 'GET', url: canonicalPath });
        assert.equal(page.statusCode, 200);
        assert.match(page.body, /<meta name="robots" content="noindex"/, `expected ${id} to carry noindex`);
      }

      const openDetail = await courseService.getPublicById(linkedCourseId, new Date());
      const openPath = `/courses/${encodeURIComponent(openDetail.id)}/${encodeURIComponent(openDetail.slug)}`;
      const openPage = await app.inject({ method: 'GET', url: openPath });
      assert.equal(openPage.statusCode, 200);
      assert.doesNotMatch(openPage.body, /<meta name="robots" content="noindex"/);
    });

    // Test 4 (plan, section 8): the sitemap excludes a closed course from
    // the day it closes, stricter than the seven-day grace every other
    // surface gives it.
    test('the sitemap lists an open course and excludes one whose registration is already closed, even inside its listed week', async () => {
      const openDetail = await courseService.getPublicById(linkedCourseId, new Date());
      const closedDetail = await courseService.getPublicById(closedWithinWeekCourseId, new Date());
      const openPath = `/courses/${encodeURIComponent(openDetail.id)}/${encodeURIComponent(openDetail.slug)}`;
      const closedPath = `/courses/${encodeURIComponent(closedDetail.id)}/${encodeURIComponent(closedDetail.slug)}`;

      const res = await app.inject({ method: 'GET', url: '/sitemap.xml' });
      assert.equal(res.statusCode, 200);
      assert.match(res.body, new RegExp(`<loc>[^<]*${escapeForRegExp(openPath)}</loc>`));
      assert.doesNotMatch(res.body, new RegExp(`<loc>[^<]*${escapeForRegExp(closedPath)}</loc>`));
    });

    // Test 5 (plan, section 8).
    test("a rav's rendered page links to his open course's canonical path", async () => {
      const detail = await courseService.getPublicById(linkedCourseId, new Date());
      const courseHref = `/courses/${encodeURIComponent(detail.id)}/${encodeURIComponent(detail.slug)}`;
      const rabbiHref = `/rabbis/${encodeURIComponent(rabbiId)}/${encodeURIComponent(toSlug(rabbiName) || rabbiId)}`;

      const page = await app.inject({ method: 'GET', url: rabbiHref });
      assert.equal(page.statusCode, 200);
      assert.ok(page.body.includes(`href="${courseHref}"`), `expected the rabbi's page to link to ${courseHref}`);
    });
  });

  // The calendar routes, case 7-9 and 11 of the plan. Own app, not
  // `buildApp`: the rate limit these routes depend on is registered by
  // `src/index.ts` and `buildApp` deliberately omits it, so the header that
  // proves the rate-limited route (not the bare catch-all) answers the path
  // could never appear there. The SSR plugin itself is the production one.
  describe('the lesson calendar and the link previews', () => {
    let calendarApp: FastifyInstance;
    let cityCode: number;

    const rabbiIds: string[] = [];
    const lessonIds: string[] = [];
    const placeIds: string[] = [];

    const PHOTO_URL = 'https://photos.example.test/rabbi-with-photo.jpg';
    const BASE_START_TIME = '19:30';
    const MODIFIED_START_TIME = '21:15';

    const weekdayOf = (isoDate: string): number => new Date(`${isoDate}T00:00:00Z`).getUTCDay();

    const createRabbi = async (honorific: 'rav' | 'rabbanit', photoUrl?: string): Promise<{ id: string; name: string; honorific: 'rav' | 'rabbanit' }> => {
      const rabbi = { id: `ssr-test-rabbi-${nanoid(8)}`, name: `רב לבדיקת יומן ${nanoid(6)}`, honorific };
      await db.insert(rabbis).values({ ...rabbi, photoUrl });
      rabbiIds.push(rabbi.id);
      return rabbi;
    };

    const createLesson = async (fields: {
      rabbiId: string;
      audience: 'men' | 'women';
      recurrence: { kind: 'once'; date: string } | { kind: 'weekly'; weekday: number };
    }): Promise<string> => {
      const id = `ssr-test-lesson-${nanoid(8)}`;
      await db.insert(lessons).values({
        id,
        rabbiId: fields.rabbiId,
        addressName: 'בית מדרש לבדיקת יומן',
        addressStreet: 'רחוב הבדיקה 1',
        cityCode,
        audience: fields.audience,
        recurrenceKind: fields.recurrence.kind,
        ...(fields.recurrence.kind === 'once'
          ? { recurrenceDate: fields.recurrence.date }
          : { recurrenceWeekdays: [fields.recurrence.weekday] }),
        startTime: BASE_START_TIME,
        durationMinutes: 60,
      });
      lessonIds.push(id);
      return id;
    };

    // Joins what a calendar app joins: a folded line is one logical line.
    const unfold = (ics: string): string => ics.replace(/\r\n[ \t]/g, '');
    const eventBlocksOf = (ics: string): string[] => unfold(ics).split('BEGIN:VEVENT\r\n').slice(1);
    const uidOf = (date: string, lessonId: string): string => `UID:${lessonId}-${date}@${CALENDAR_SITE_HOST}`;

    // Every date of a weekly lesson inside the calendar window, never a
    // hard-coded count: the window is inclusive of today and today plus the
    // horizon, so the count is 12 or 13 depending on the weekday.
    const windowDatesOn = (today: string, weekday: number): string[] =>
      Array.from({ length: CALENDAR_HORIZON_DAYS + 1 }, (_, offset) => addDays(today, offset)).filter((date) => weekdayOf(date) === weekday);

    // The window starts at today in Israel, so a pair of fetches straddling
    // midnight there would compare two different windows. Re-runs the whole
    // body once if the day rolled over underneath it; the ETag assertion
    // never spans a date change.
    const withStableDay = async (run: (today: string) => Promise<void>): Promise<void> => {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const today = todayInIsrael(new Date());
        await run(today);
        if (todayInIsrael(new Date()) === today) return;
      }
      assert.fail('the Israel date changed during both attempts of one test');
    };

    const metaContents = (html: string, attribute: 'name' | 'property', value: string): string[] =>
      [...html.matchAll(new RegExp(`<meta[^>]*${attribute}="${escapeForRegExp(value)}"[^>]*>`, 'g'))].map(
        (tag) => /content="([^"]*)"/.exec(tag[0])?.[1] ?? '',
      );

    let rabbanit: { id: string; name: string; honorific: 'rav' | 'rabbanit' };
    let weeklyLessonId: string;
    let weeklyWeekday: number;
    let cancelledDate: string;
    let modifiedDate: string;

    before(async () => {
      calendarApp = Fastify({ logger: false });
      await calendarApp.register(rateLimit, { global: false });
      await registerSsr(calendarApp);
      registerErrorHandler(calendarApp);

      const [city] = await db.select({ code: cities.code }).from(cities).limit(1);
      assert.ok(city, 'expected at least one seeded city to address the test lessons in');
      cityCode = city.code;

      const today = todayInIsrael(new Date());
      weeklyWeekday = weekdayOf(addDays(today, 3));
      cancelledDate = addDays(today, 3);
      modifiedDate = addDays(today, 10);

      rabbanit = await createRabbi('rabbanit');
      weeklyLessonId = await createLesson({ rabbiId: rabbanit.id, audience: 'women', recurrence: { kind: 'weekly', weekday: weeklyWeekday } });
      await db.insert(lessonExceptions).values([
        { lessonId: weeklyLessonId, date: cancelledDate, kind: 'cancelled', reason: 'בדיקה' },
        { lessonId: weeklyLessonId, date: modifiedDate, kind: 'modified', startTime: MODIFIED_START_TIME },
      ]);
    });

    after(async () => {
      await calendarApp.close();
      await db.delete(lessonExceptions).where(inArray(lessonExceptions.lessonId, lessonIds));
      await db.delete(lessons).where(inArray(lessons.id, lessonIds));
      await db.delete(places).where(inArray(places.id, placeIds));
      await db.delete(rabbis).where(inArray(rabbis.id, rabbiIds));
    });

    // Case 7. Catches duplicate events on refresh (an unstable UID), a
    // cancellation that never reaches the calendar, and a body that changes
    // on every fetch (a DTSTAMP read off the clock), which would defeat the
    // ETag.
    test('the feed lists every date in the window with stable UIDs, marks the cancelled one, and answers a repeat with 304', async () => {
      await withStableDay(async (today) => {
        const url = `/lesson/${weeklyLessonId}/calendar.ics`;
        const first = await calendarApp.inject({ method: 'GET', url });
        assert.equal(first.statusCode, 200);
        assert.match(first.headers['content-type'] as string, /^text\/calendar/);
        assert.equal(first.headers['cache-control'], CALENDAR_CACHE_HEADERS['Cache-Control']);
        const etag = first.headers['etag'] as string | undefined;
        assert.ok(etag, 'expected the feed to carry an ETag');

        const expectedDates = windowDatesOn(today, weeklyWeekday);
        const blocks = eventBlocksOf(first.body);
        assert.equal(blocks.length, expectedDates.length, `expected one VEVENT per date in the window (${expectedDates.join(', ')})`);

        const second = await calendarApp.inject({ method: 'GET', url });
        const uidsOf = (ics: string): string[] => [...unfold(ics).matchAll(/^UID:.*$/gm)].map((match) => match[0]);
        assert.deepEqual(uidsOf(second.body), uidsOf(first.body));
        assert.deepEqual(uidsOf(first.body), expectedDates.map((date) => uidOf(date, weeklyLessonId)));
        assert.equal(second.body, first.body, 'a feed that changes between two fetches can never be answered with a 304');

        const cancelledBlock = blocks.find((block) => block.includes(uidOf(cancelledDate, weeklyLessonId)));
        assert.ok(cancelledBlock, 'expected the cancelled date to stay in the feed');
        assert.match(cancelledBlock, /STATUS:CANCELLED/);
        assert.match(cancelledBlock, /SUMMARY:מבוטל: /);

        const liveBlocks = blocks.filter((block) => block !== cancelledBlock);
        assert.ok(liveBlocks.length > 0);
        for (const block of liveBlocks) {
          assert.match(block, /STATUS:CONFIRMED/);
          assert.doesNotMatch(block, /SUMMARY:מבוטל/);
          assert.ok(block.includes('לנשים'), "expected a rabbanit's women-only lesson to say who it is for");
          assert.ok(block.includes(rabbiDisplayName(rabbanit)), 'expected the rabbi to be named with the honorific');
        }

        const revalidated = await calendarApp.inject({ method: 'GET', url, headers: { 'if-none-match': etag } });
        assert.equal(revalidated.statusCode, 304);
        assert.equal(revalidated.body, '');
        assert.equal(revalidated.headers['etag'], etag);
      });
    });

    // Case 8. The rate-limit header is the cheap proof that the rate-limited
    // Fastify route, not the bare catch-all, serves the path; exhausting the
    // bucket would cost minutes of test time for the same wiring proof.
    test('an unknown well-formed id is an empty calendar, a malformed id is an uncached 400, and the route is rate limited', async () => {
      const unknown = await calendarApp.inject({ method: 'GET', url: `/lesson/ssr-test-no-such-lesson/calendar.ics` });
      assert.equal(unknown.statusCode, 200);
      assert.match(unknown.body, /^BEGIN:VCALENDAR/);
      assert.match(unknown.body, /END:VCALENDAR\r\n$/);
      assert.equal(eventBlocksOf(unknown.body).length, 0);
      assert.equal(unknown.headers['x-ratelimit-limit'], String(CALENDAR_RATE_LIMIT_MAX));

      const malformed = await calendarApp.inject({ method: 'GET', url: '/lesson/%20/calendar.ics' });
      assert.equal(malformed.statusCode, 400);
      assert.equal(malformed.headers['cache-control'], 'no-store');
    });

    // Case 9.
    test('event.ics for a date with a modified time is one event at the modified time with the disclaimer, and a date the lesson lacks is a 404', async () => {
      const res = await calendarApp.inject({ method: 'GET', url: `/lesson/${weeklyLessonId}/${modifiedDate}/event.ics` });
      assert.equal(res.statusCode, 200);
      assert.match(res.headers['content-type'] as string, /^text\/calendar/);
      assert.match(res.headers['content-disposition'] as string, /^attachment; filename="lesson\.ics"$/);

      const blocks = eventBlocksOf(res.body);
      assert.equal(blocks.length, 1);
      const [block = ''] = blocks;
      assert.ok(
        block.includes(`DTSTART:${calendarUtcStamp(new Date(israelDateTime(modifiedDate, MODIFIED_START_TIME)))}`),
        `expected the event at the modified ${MODIFIED_START_TIME}, not the base ${BASE_START_TIME}`,
      );
      assert.ok(block.includes(escapeIcsText(STATIC_EVENT_DISCLAIMER)), 'expected the one-off event to say it never updates');

      const notALessonDate = addDays(modifiedDate, 1);
      assert.notEqual(weekdayOf(notALessonDate), weeklyWeekday);
      const missing = await calendarApp.inject({ method: 'GET', url: `/lesson/${weeklyLessonId}/${notALessonDate}/event.ics` });
      assert.equal(missing.statusCode, 404);
      assert.equal(missing.headers['cache-control'], 'no-store');
    });

    // Case 11. A rabbi's poster or nothing, never the logo, and exactly one
    // card tag whose size follows the image.
    describe('link previews', () => {
      const expectPhotoPreview = (html: string): void => {
        assert.deepEqual(metaContents(html, 'property', 'og:image'), [PHOTO_URL]);
        assert.deepEqual(metaContents(html, 'name', 'twitter:card'), ['summary_large_image']);
      };

      const expectNoImagePreview = (html: string): void => {
        assert.deepEqual(metaContents(html, 'property', 'og:image'), []);
        assert.deepEqual(metaContents(html, 'name', 'twitter:card'), ['summary']);
      };

      test("a lesson page carries its teaching rabbi's photo, or no image at all with the small card", async () => {
        const date = addDays(todayInIsrael(new Date()), 5);
        const withPhoto = await createRabbi('rav', PHOTO_URL);
        const withoutPhoto = await createRabbi('rav');
        const withPhotoLessonId = await createLesson({ rabbiId: withPhoto.id, audience: 'men', recurrence: { kind: 'once', date } });
        const withoutPhotoLessonId = await createLesson({ rabbiId: withoutPhoto.id, audience: 'men', recurrence: { kind: 'once', date } });

        const photoPage = await calendarApp.inject({ method: 'GET', url: lessonPath({ lessonId: withPhotoLessonId, date }) });
        assert.equal(photoPage.statusCode, 200);
        expectPhotoPreview(photoPage.body);

        const barePage = await calendarApp.inject({ method: 'GET', url: lessonPath({ lessonId: withoutPhotoLessonId, date }) });
        assert.equal(barePage.statusCode, 200);
        expectNoImagePreview(barePage.body);
      });

      // The reviewer's regression guard: reading `occurrence.rabbi.photoUrl`
      // instead of the teaching rabbi's would pass every case above, because
      // none of them has a substitute.
      test("a lesson page takes its image from the substitute who teaches that date, not from the lesson's own rabbi", async () => {
        const today = todayInIsrael(new Date());
        const substituteDate = addDays(today, 3);
        const ordinaryDate = addDays(today, 10);
        const lessonRabbi = await createRabbi('rav');
        const substitute = await createRabbi('rav', PHOTO_URL);
        const lessonId = await createLesson({ rabbiId: lessonRabbi.id, audience: 'men', recurrence: { kind: 'weekly', weekday: weekdayOf(substituteDate) } });
        await db.insert(lessonExceptions).values({ lessonId, date: substituteDate, kind: 'modified', substituteRabbiId: substitute.id });

        const substitutePage = await calendarApp.inject({ method: 'GET', url: lessonPath({ lessonId, date: substituteDate }) });
        assert.equal(substitutePage.statusCode, 200);
        expectPhotoPreview(substitutePage.body);

        const ordinaryPage = await calendarApp.inject({ method: 'GET', url: lessonPath({ lessonId, date: ordinaryDate }) });
        assert.equal(ordinaryPage.statusCode, 200);
        expectNoImagePreview(ordinaryPage.body);
      });

      test('a rabbi page carries the rabbi photo, or no image at all with the small card', async () => {
        const withPhoto = await createRabbi('rav', PHOTO_URL);
        const withoutPhoto = await createRabbi('rav');
        const rabbiUrl = (rabbi: { id: string; name: string }): string => `/rabbis/${encodeURIComponent(rabbi.id)}/${encodeURIComponent(toSlug(rabbi.name) || rabbi.id)}`;

        const photoPage = await calendarApp.inject({ method: 'GET', url: rabbiUrl(withPhoto) });
        assert.equal(photoPage.statusCode, 200);
        expectPhotoPreview(photoPage.body);

        const barePage = await calendarApp.inject({ method: 'GET', url: rabbiUrl(withoutPhoto) });
        assert.equal(barePage.statusCode, 200);
        expectNoImagePreview(barePage.body);
      });

      test('a place page with no photo carries no image and the small card', async () => {
        const id = `ssr-test-place-${nanoid(8)}`;
        await db.insert(places).values({ id, slug: id, name: `מקום לבדיקת תצוגה ${nanoid(6)}`, street: 'רחוב הבדיקה 1', cityCode });
        placeIds.push(id);

        const place = await placeService.getById(id);
        const page = await calendarApp.inject({ method: 'GET', url: `/places/${encodeURIComponent(place.id)}/${encodeURIComponent(place.slug)}` });
        assert.equal(page.statusCode, 200);
        expectNoImagePreview(page.body);
      });
    });

    // Case 13. A shared link is the bare id plus `?s`, so WhatsApp carries no
    // percent-encoded slug. The 301 to the canonical path used to drop the
    // query string, losing the share tag (and any utm tags) on arrival.
    describe('a bare-id link keeps its query string through the canonical redirect', () => {
      test('/rabbis/<id>?s answers 301 to the canonical slug path plus ?s', async () => {
        const rabbi = await createRabbi('rav');

        const res = await calendarApp.inject({ method: 'GET', url: `/rabbis/${encodeURIComponent(rabbi.id)}?s` });
        assert.equal(res.statusCode, 301);
        assert.equal(res.headers['location'], `/rabbis/${encodeURIComponent(rabbi.id)}/${encodeURIComponent(toSlug(rabbi.name) || rabbi.id)}?s`);
      });

      test('/places/<id>?s answers 301 to the canonical slug path plus ?s', async () => {
        const id = `ssr-test-place-${nanoid(8)}`;
        await db.insert(places).values({ id, slug: id, name: `מקום לבדיקת הפניה ${nanoid(6)}`, street: 'רחוב הבדיקה 1', cityCode });
        placeIds.push(id);
        const place = await placeService.getById(id);

        const res = await calendarApp.inject({ method: 'GET', url: `/places/${encodeURIComponent(id)}?s` });
        assert.equal(res.statusCode, 301);
        assert.equal(res.headers['location'], `/places/${encodeURIComponent(place.id)}/${encodeURIComponent(place.slug)}?s`);
      });
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

// Case 10. The calendar's serializer and its time conversion, pure: no
// database and no client build, so they sit outside the suite's `before`.
// Each is a defect a calendar app shows as garbage or as the wrong hour.
describe('the calendar serializer and its time conversion', () => {
  test('a 20:30 lesson is 18:30 UTC in January and 17:30 UTC in July', () => {
    assert.equal(calendarUtcStamp(new Date(israelDateTime('2027-01-12', '20:30'))), '20270112T183000Z');
    assert.equal(calendarUtcStamp(new Date(israelDateTime('2026-07-14', '20:30'))), '20260714T173000Z');
  });

  test('a long Hebrew line folds under 75 octets without splitting a two-byte letter', () => {
    const line = `DESCRIPTION:${'שיעור בפרשת השבוע '.repeat(12)}`;
    const folded = foldIcsLine(line);

    const physicalLines = folded.split('\r\n');
    assert.ok(physicalLines.length > 1, 'expected a line this long to fold');
    for (const physical of physicalLines) {
      assert.ok(Buffer.byteLength(physical, 'utf8') <= 75, `expected at most 75 octets, got ${Buffer.byteLength(physical, 'utf8')}`);
    }
    // Every continuation starts with the one space that marks it, and the
    // unfolded text is the original: no letter was cut or dropped.
    assert.ok(physicalLines.slice(1).every((physical) => physical.startsWith(' ')));
    assert.equal(folded.replace(/\r\n /g, ''), line);
    assert.ok(!folded.includes('�'));
  });

  // Expectations spell the backslash as a character code, so the test reads
  // the same whatever happens to a doubled backslash on its way into a file.
  test('a comma, a semicolon, a backslash and a newline in a text value are escaped', () => {
    const backslash = String.fromCharCode(92);
    const escaped = (character: string): string => `${backslash}${character}`;

    assert.equal(escapeIcsText('a,b'), `a${escaped(',')}b`);
    assert.equal(escapeIcsText('a;b'), `a${escaped(';')}b`);
    assert.equal(escapeIcsText(`a${backslash}b`), `a${backslash}${backslash}b`);
    assert.equal(escapeIcsText('a\nb'), `a${escaped('n')}b`);
    assert.equal(escapeIcsText('a\r\nb'), `a${escaped('n')}b`);
  });

  const event: CalendarEvent = {
    uid: `lesson-1-2026-10-13@${CALENDAR_SITE_HOST}`,
    startUtc: new Date('2026-10-13T17:30:00Z'),
    endUtc: new Date('2026-10-13T18:30:00Z'),
    summary: 'שיעור, עם הרב',
    location: 'בית מדרש; רחוב 1, עיר',
    description: 'שורה ראשונה\nשורה שנייה',
    url: 'https://torahbarabim.com/lesson/lesson-1/2026-10-13?utm_source=calendar',
    isCancelled: false,
  };

  test('a serialized event ends every line with CRLF, escapes its text, and keeps a URL as it is', () => {
    const ics = serializeCalendar([{ event, stampedAt: new Date('2026-10-06T00:00:00Z') }]);

    assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
    assert.ok(!/[^\r]\n/.test(ics), 'expected no bare line feed');
    const unfolded = ics.replace(/\r\n /g, '');
    assert.ok(unfolded.includes('SUMMARY:שיעור\\, עם הרב\r\n'));
    assert.ok(unfolded.includes('DESCRIPTION:שורה ראשונה\\nשורה שנייה\r\n'));
    assert.ok(unfolded.includes('URL:https://torahbarabim.com/lesson/lesson-1/2026-10-13?utm_source=calendar\r\n'));
  });

  test('the same data serializes to the same bytes, and a later revision carries a higher SEQUENCE', () => {
    const entry = (revisedAt: Date) => ({ event, stampedAt: revisedAt, revisedAt });
    const sequenceOf = (ics: string): number => Number(/SEQUENCE:(\d+)/.exec(ics)?.[1]);

    const earlier = serializeCalendar([entry(new Date('2026-10-06T08:00:00Z'))]);
    assert.equal(serializeCalendar([entry(new Date('2026-10-06T08:00:00Z'))]), earlier);

    const later = serializeCalendar([entry(new Date('2026-10-06T08:05:00Z'))]);
    assert.equal(sequenceOf(later), sequenceOf(earlier) + 5);
  });
});
