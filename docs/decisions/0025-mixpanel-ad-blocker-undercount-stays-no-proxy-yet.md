# 0025: Mixpanel's ad-blocker undercount stays, no same-origin proxy yet

- **Status:** accepted
- **Date:** 2026-09-14
- **Decided by:** goorlavi
- **Refines:** [0024](0024-visits-are-measured-by-mixpanel-full-tracking-no-consent-banner.md)

## Context

[0024](0024-visits-are-measured-by-mixpanel-full-tracking-no-consent-banner.md) already
named ad-blocker undercounting as a cost of tracking client-side. The follow-up question
was whether the fix, routing Mixpanel's calls through the site's own domain instead of
`api.mixpanel.com` directly, is worth doing now, since an ad blocker matches on domain
and would stop catching a same-origin call.

## Decision

**Not doing it now.** The fix means a new server route that forwards every analytics
call to Mixpanel, which is real engineering work and a new dependency: if that route or
the server it lives on goes down, analytics goes down with it, which is not true today
(a call straight to Mixpanel keeps working even if this site's own server does not).

**This is not a dollar cost.** The server already runs continuously (Fargate, per
[0010](0010-production-shape-traded-for-cost.md)), and API Gateway is priced per
request at a fraction of a cent; the extra traffic from analytics calls would not move
the AWS bill in any noticeable way. The real cost is maintenance and a new failure mode,
not money, and an earlier statement in conversation that called this "more expensive"
was imprecise and is corrected here.

## Consequences

**The event counts stay a floor, not a total**, exactly as [0024](0024-visits-are-measured-by-mixpanel-full-tracking-no-consent-banner.md)
already said. Nothing changes about what the numbers mean.

**The fix is known and cheap to describe, expensive only in that someone has to build
and own it**: a resource route on the server that forwards Mixpanel's ingestion calls,
and a client-side base URL change to call it instead of `api.mixpanel.com`. Whoever
picks this up later starts from this record, not from scratch.

## Rejected

**Building the proxy now.** Correct fix, deferred rather than rejected on merit: it is
its own piece of work with its own review, not something to fold into an unrelated
conversation.
