# 0037: Viewers in China and Russia are blocked at the edge, and the United States never is

- **Status:** accepted
- **Date:** 2026-09-27
- **Decided by:** project owner
- **Related:** [0010](0010-production-shape-traded-for-cost.md), which set the cost
  ceiling this stays under, and
  [0024](0024-visits-are-measured-by-mixpanel-full-tracking-no-consent-banner.md), whose
  reports are where the problem showed up

## Context

Mixpanel showed a steady share of visits from China and the United States on a site
whose whole audience is in Israel. Mixpanel's own SDK already drops the named crawlers
(Googlebot, Bingbot and the like) by user agent, so what remained was automation that
runs a real browser, mostly from cloud providers, plus a smaller number of real people
abroad. None of it costs money: the container is a fixed cost, and CloudFront and API
Gateway are inside their free tiers at this traffic. The harm is noise in the reports.

Two constraints shaped the answer. The owner wants the site to stay reachable by the
search and answer engines, and Google, OpenAI and Anthropic all crawl from addresses in
the United States, as does Facebook's crawler when a lesson is shared there. And the
budget in [0010](0010-production-shape-traded-for-cost.md) leaves no room for a paid
firewall.

## Decision

**CloudFront refuses viewers from China and Russia at the edge**, with a denylist, and
they receive CloudFront's bare 403. The list is the single constant
`BLOCKED_VIEWER_COUNTRIES` in `infra/lib/consts.ts`; the distribution reads it and
`infra/test/site-stack.test.ts` asserts it.

**The United States is never on that list**, and the same test fails if it ever is.
Israel likewise.

**The reports are cleaned where they are made.** The client no longer initialises
Mixpanel in an automated browser (one that sets `navigator.webdriver`, or whose user
agent says headless, bot, crawler or spider). That, not the edge block, is expected to
remove most of the noise: the automation that reaches Mixpanel runs mainly from the
United States and Europe, which stay open. The check is Mixpanel's country breakdown a
week after the deploy, the same way
[0024](0024-visits-are-measured-by-mixpanel-full-tracking-no-consent-banner.md) left its
first real check to the live dashboard.

## Consequences

- **A person in China or Russia cannot open the site through its domain**, including an
  Israeli travelling there. They see CloudFront's default 403 page, which is in English:
  a deliberate exception to the Hebrew-only rule, on a screen with no audience. The clean
  fix is out of reach: a 403 entry in the distribution's `errorResponses` applies to the
  whole distribution and would rewrite the real 403 a missing S3 object answers, and a
  Lambda@Edge function is ruled out by [0010](0010-production-shape-traded-for-cost.md).
  A Hebrew page would mean a CloudFront Function on every behavior in place of the
  built-in restriction, not done for a screen nobody is meant to see.
  The API's own `execute-api` hostname stays reachable directly, so this is tidying at
  the edge, not an access control.
- **Baidu and Yandex can no longer index the site**, `robots.txt` included: they crawl
  from China and Russia. Accepted: the audience does not use them.
- **A Playwright or Puppeteer check against production now produces no Mixpanel
  events.** That is the guard working, not tracking that broke.
- **The block barely moves the Mixpanel numbers on its own.** It is a hygiene measure
  against the scanners that probe every new domain, not the fix for the reports.
- **The constant is an access decision.** Adding a country to it is a new record that
  supersedes this one, never a quiet edit.
- **The restriction reaches production only when the owner deploys `TorabarabimSite`
  by hand** from the primary checkout; the automated deploy in `deploy.yml` never runs
  `cdk deploy`.
- **A real visitor on a phone whose model name contains "bot" is no longer counted.**
  Known and accepted: the visitor sees nothing different.
- **The automated-browser guard has no test.** The client's Vitest runs stories only,
  and the predicate has no home to be asserted in. It is small enough to be reviewed
  instead.

## Rejected

- **Blocking the United States.** Removes exactly the traffic the owner wants: Google,
  OpenAI, Anthropic, and Facebook's link previews. A "smart" block that lets verified
  bots through needs a firewall that verifies them.
- **An allowlist of Israel only.** Locks out Israelis abroad, the crawlers above, and
  anyone sharing a lesson from outside the country.
- **AWS WAF with Bot Control.** Roughly fifteen to twenty dollars a month on a bill of
  thirty to thirty-four. It would filter automation properly, but it is a firewall for
  a problem that costs nothing today; [0010](0010-production-shape-traded-for-cost.md) rules it out.
- **Not sending events from outside Israel.** CloudFront knows the viewer's country and
  could pass it to the server, but the document cache would then have to key on it or
  serve one country's flag to the next. Deferred until a country filter in Mixpanel
  itself proves insufficient.
