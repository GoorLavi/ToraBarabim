# 0022: Visits are measured by Cloudflare Web Analytics, cookieless and without events

- **Status:** accepted
- **Date:** 2026-09-09
- **Decided by:** goorlavi

## Context

The site shipped with no measurement of any kind. Nobody knew how many people reached
it, which pages they landed on, or whether anyone got from a search to a lesson, so
every product decision after launch was a guess.

The request was Google Analytics. Planning it surfaced the real cost, and it had nothing
to do with Google: GA4 sets cookies and identifies people, which pulled in a Hebrew
consent banner, a `/privacy` page, a design round, a theme change for layering and
shadow, and roughly fourteen files. All of that existed to answer "how many visits".

Israeli law does not require a consent banner the way GDPR does, and the audience here
is Israeli, so the banner was elective rather than forced. It was still real work, and
it was work the question did not need.

## Decision

**Visits are measured by Cloudflare Web Analytics**, its JavaScript beacon, on the free
plan. No cookies, no persistent identifier, no consent banner, and no `/privacy` page.

**One tag, in `client/index.html`, and nothing else.** No analytics module, no provider,
no hook, no instrumentation inside any feature component.

**`spa: true` is part of the tag and is load-bearing.** Every navigation after the first
document load is a `history.pushState`, and without the flag the beacon reports only the
URL the reader entered on, collapsing the top-pages report to a single row.

**The tag is injected only into a production build**, by the `analytics-beacon` plugin
in `client/vite.config.ts`. The token is the live site's, so a dev server carrying the
tag would report `localhost` page views into the real dashboard. The placeholder
resolves to nothing while Vite is serving.

**The site token is committed, in `client/consts.ts`.** It is public by design: it ships
in the page source of every site using the product and grants nothing beyond reporting a
page view for this site. It is not covered by the secrets rule in `CLAUDE.md`.

## Consequences

**We will know how many people come and where they land, and nothing about what they
wanted.** Cloudflare Web Analytics has no custom-event API, so `search`, `filter_city`
and `filter_date` do not exist. This is the largest cost of the choice and it was
accepted knowingly.

**There is no indirect route to that data either.** Cloudflare strips query strings
before recording a path, deliberately, to avoid collecting sensitive data. Since every
filter on this site lives in the query string (`q`, `cityId`, `when`, `date`), the
"read it off the top-pages report" workaround that made this choice look cheaper is
closed. **Which cities people search for is not measured at all.**

**Geography is country level only.** No city breakdown. That matters less than it
sounds: IP-derived city is unreliable for Israeli mobile traffic, which routes through
central carrier gateways, and the accurate signal was always the `cityId` filter, which
is the thing we just gave up.

**History is six months on the free plan.** Year-over-year comparison is not available
and will not become available without changing tools.

**The count is a floor, not a total.** Ad blockers block
`static.cloudflareinsights.com`. Treat the number as a trend compared against itself,
never as an absolute. Proxying the script through the site's own CloudFront
distribution would fix this and is deliberately not done.

**The project now depends on a Cloudflare account** that holds nothing else. The domain
was added there as a zone during setup; the nameservers were **not** changed and must
not be. DNS stays in Route 53, where `infra/lib/site-stack.ts` writes records and the
us-east-1 certificate validates against them.

**The `/privacy` page was scoped, approved, and then dropped when the premise changed.**
It existed to give the consent banner somewhere to link. With no banner, no cookies and
no personal identifier, nothing links to it. This is a gap accepted on purpose; writing
one is a small, independent piece of work whenever it is wanted.

**Whether the beacon actually counts route changes was not verified in this change.**
`static.cloudflareinsights.com` is unreachable from the agent environment, so the
production build was confirmed to carry the tag and the dev server confirmed not to,
but no beacon was ever seen firing. First real check is on the live site after deploy.

**If the city question becomes urgent, the answer is not to revisit this record.** The
API already receives every search with its filters, so counting them server side would
be exact, free, and unaffected by ad blockers. That is its own decision.

## Rejected

**Google Analytics 4**, the original request. Free and the deepest tool of the four, and
the only one that would still be the right answer in two years if funnels and cohorts
are wanted. Rejected because cookies and identity brought a consent banner, a privacy
page and a design round with them, to answer a question that needs none of it, and
because GA4's interface is a burden for "how many visits".

**Plausible**, at roughly nine dollars a month. Cookieless like Cloudflare, but with
proper custom events, city-level geography, and a weekly summary by email so the number
arrives without anyone opening a dashboard. Recommended and rejected: the owner chose
not to pay for it.

**Mixpanel.** Its free tier is genuinely free, and an earlier draft of this reasoning
wrongly implied otherwise. Rejected on fit, not price: it is a product-analytics tool
built around funnels and retention, it has no pageview or referrer reporting out of the
box, and it sets a persistent `distinct_id`, which raises the same identity question
that made GA4 expensive here.

**Cloudflare's zone analytics** (`HTTP Traffic`), which is a different product sharing
the word. It measures traffic through Cloudflare's proxy, and this site is served by
CloudFront, so it reports zero and always will. Reaching it would mean moving
nameservers off Route 53, which would break the certificate validation and the records
CDK manages. Never on the table once understood.

**Counting searches server side instead.** Exact, free, and immune to ad blockers, but
it answers a different question than "how many visits" and needs storage and a way to
read it. Deferred, not rejected on merit.
