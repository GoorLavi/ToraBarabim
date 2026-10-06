# 0056: Each lesson has a public calendar feed

- **Status:** accepted
- **Date:** 2026-10-06
- **Decided by:** goorlavi

## Context

The subscription in [0055](0055-a-lesson-goes-into-a-calendar-as-a-copy-or-a-subscription.md)
needs a URL that calendar apps fetch without signing in, for as long as someone stays
subscribed. Every event title carries the rabbi's name through `rabbiDisplayName`,
which lives only in the client workspace; the server compiles alone and cannot import
it.

## Decision

- **`/lesson/:lessonId/calendar.ics` is the feed**, public and unauthenticated, and
  `/lesson/:lessonId/:date/event.ics` is the single-date copy. Both are React Router
  resource routes (the `sitemap.xml` shape), not `/v1` routes, so one event composer in
  the client workspace serves the feed, the file and the Google link.
- **The window is today to 12 weeks ahead.** Cancelled dates stay in it, marked
  cancelled and prefixed "מבוטל:", so the calendar shows why the lesson is gone.
- **A deleted lesson serves an empty calendar**, not a 404, which clears it from every
  subscriber's calendar. A malformed id is a 400.
- **Each event's id is the lesson and the date**, and its revision comes from the
  lesson's and that date's exception's last change, so a refresh updates an event
  rather than duplicating it.
- **Cached at the edge for an hour** with the query string out of the cache key, and
  rate limited per visitor. Error responses are never cached.

## Consequences

- The feed URL is a contract with every subscriber's calendar and can never be renamed
  or moved.
- Past dates leave a subscribed calendar as the window moves on.
- The feed is a second public read surface for lesson data, outside `/v1`, with its own
  rate limit and CloudFront behaviour that the human deploys.
- Anyone can read a lesson's next 12 weeks without the site, which is what the listings
  are for anyway.

## Rejected

- **A `/v1` route.** Would need a second, hand-copied `rabbiDisplayName` on the server,
  which breaks the rule that the honorific is always built in one place.
- **404 for a deleted lesson.** Calendar apps tend to keep the last copy they fetched,
  so subscribers would keep a lesson that no longer exists.
- **An open-ended recurrence rule with exceptions.** Expanding each date explicitly lets
  a moved or cancelled date travel as itself and keeps every client's behaviour the
  same.
