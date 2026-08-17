# 0007: The admin panel is a section of the same app

- **Status:** accepted
- **Date:** 2026-08-14
- **Decided by:** project owner

## Context

The admin panel could be a separate application on its own subdomain, or a section of
the public site behind a login.

## Decision

The panel lives at `/admin` inside the same client application, sharing its build,
deploy, and design system. Its API sits under `/v1/admin` behind the session guard.

The panel is designed for phone and desktop equally, unlike the public site, which is
phone first. Data entry happens at a desk and also on the move.

## Consequences

- One deploy, one design system, one set of components. A change to a shared component
  affects both, which is the point and also the risk.
- The panel's JavaScript is served to every visitor, including those who can never log
  in. It is a modest amount of code and contains no secrets, but it is not hidden, and
  it grows as the panel grows. If it ever becomes large, splitting it into its own
  bundle is the fix, not moving it to another domain.
- Access control is entirely server side. Hiding the route in the client is presentation,
  never protection: every `/v1/admin` route is guarded independently.
- Designing the panel for phones as well as desktop roughly doubles the design and build
  surface compared to a desktop only panel.

## Rejected

- **A separate subdomain.** Keeps admin code away from the public entirely and allows
  network level blocking, at the cost of a second deploy, a second certificate, and
  cross domain cookies.
- **A separate application in the repository.** Same overhead, plus a duplicated design
  system that drifts.
