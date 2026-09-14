# 0024: Visits are measured by Mixpanel, with full tracking and no consent banner

- **Status:** accepted
- **Date:** 2026-09-14
- **Decided by:** goorlavi

## Context

[0022](0022-visits-are-measured-by-cloudflare-web-analytics.md) chose Cloudflare Web
Analytics specifically to avoid identifying visitors, and rejected Mixpanel in the same
breath for setting a persistent visitor ID. That record's whole shape, no cookies, no
consent banner, no `/privacy` page, was built around not needing to answer the identity
question.

The request now is Mixpanel anyway. The reason is real: Cloudflare Web Analytics has no
custom-event API and strips query strings before recording a path, so it could not
answer which cities people search for or what they filter by, which is the question the
product actually needs answered. Mixpanel's free tier covers this site's volume.

## Decision

**Visits, searches, and filter use are measured by Mixpanel**, using its default
tracking: a persistent visitor ID (`distinct_id`) stored in the browser, the same
identity model [0022](0022-visits-are-measured-by-cloudflare-web-analytics.md) rejected
Mixpanel for.

**No consent banner and no `/privacy` page.** This is a deliberate, named gap, not an
oversight: Israeli law does not force a banner the way GDPR does, and the owner chose to
accept the identity tracking rather than build the banner and the page it would need to
link to. If EU traffic becomes material, or the product starts holding data that
identifies a person rather than a browser, this gap is the first thing to revisit.

**Four events are tracked**, from `client/src/analytics/`:
- a page view, on every route change
- `search`, when a query commits
- `filter_city` and `filter_date`, when either filter is set
- `lesson_click`, when a listing is opened

**The Mixpanel project token is committed**, in `client/consts.ts`, the same way the
Cloudflare site token was. It identifies which project events land in, not a person, and
grants nothing beyond sending events to this project.

**Analytics now has its own module**, `client/src/analytics/`, because there are four
real call sites from the start (page views, search, two filters, lesson clicks).
[0022](0022-visits-are-measured-by-cloudflare-web-analytics.md)'s "no analytics module,
no instrumentation inside any feature component" was correct for a single inert script
tag; it does not fit code that has to call `trackEvent` from several features.

## Consequences

**The site now identifies returning visitors by browser**, something it deliberately did
not do before. A `distinct_id` persists across sessions in the browser Mixpanel runs in;
it is not tied to a name, an email, or an account unless the code later calls
`identify()`, which it does not.

**We lose Cloudflare's six months of pageview history** with nothing carried over; the
two tools do not share a data model and no migration was attempted.

**Ad blockers that block Mixpanel's script undercount the same way Cloudflare's did.**
The counts remain a floor, not a total.

**The project now depends on a Mixpanel account** instead of Cloudflare's analytics
product. The Cloudflare DNS zone this site's certificate validation depends on
([0022](0022-visits-are-measured-by-cloudflare-web-analytics.md)) is unrelated to
Cloudflare Web Analytics and is untouched by this change.

**Whether the events fire correctly in production was not verified in this change.**
Mixpanel's ingestion endpoint is unreachable from the agent environment, so this was
confirmed against a local Mixpanel debug view only where possible. First real check is
the live dashboard after deploy.

## Rejected

**Anonymous mode** (disabling Mixpanel's persistent ID). This was the option that would
have kept the no-banner, no-identity shape of [0022](0022-visits-are-measured-by-cloudflare-web-analytics.md)
intact. Rejected by the owner in favor of full tracking, trading away that shape for
better Mixpanel features (cross-session funnels, retention) that need a persistent ID to
work.

**Adding a consent banner and `/privacy` page to go with full tracking.** This is what
[0022](0022-visits-are-measured-by-cloudflare-web-analytics.md) cut GA4 for needing.
Rejected again here, for the same reason: real work the owner chose not to do, this time
accepting the identity tracking without the banner instead of avoiding the tracking.

**Keeping Cloudflare Web Analytics.** Still the simplest tool on the table and the only
one that needed nothing built. Rejected because it cannot answer the one question the
product actually has: what people search for and filter by.
