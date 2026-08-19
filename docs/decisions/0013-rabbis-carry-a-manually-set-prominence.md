# 0013: Rabbis carry a manually set prominence

- **Status:** accepted
- **Date:** 2026-08-19
- **Decided by:** project owner

## Context

The home page rows (see [0012](0012-the-home-page-is-composed-by-the-server.md)) need an
order. Date alone is not it: the first lessons a visitor sees should be the ones most
likely to be worth their evening. There is no signal in the product yet from which that
could be derived, because there are no user accounts and nothing to measure.

## Decision

Every rabbi carries a `prominence` of `local`, `known`, or `sought`, set by an
administrator on the rabbi's profile and defaulting to `local`. In Hebrew the admin form
reads `אזורי`, `מוכר`, `מבוקש`.

Rows are ordered by that tier, highest first, then by a stable shuffle derived from the
lesson id so that nobody inside a tier is permanently last.

**The value never leaves the server.** It is a sort input. It is absent from every public
response, and it is not on the `Rabbi` wire type. When rabbis eventually get their own
logins, this is one of the things they must not be able to read about themselves.

## Consequences

- **This is an editorial judgment about real people, recorded in a database.** Someone is
  deciding which rabbis a visitor sees first. That is a genuine responsibility and it is
  named here rather than buried in a sort function.
- The field is called prominence and not popularity, because today it measures nothing.
  It is one person's judgment. A name suggesting real data would mislead the next reader.
- A new rabbi defaults to `local` and therefore starts at the bottom of every row.
- The tier is coarse, so most rabbis share one, and in practice the stable shuffle
  decides much of the visible order.

## What would change this

User accounts and a way to like a lesson. Then a real signal exists and can be folded in
beside this field, or can replace it. The sort is deliberately a single comparison in one
file so that this is a small change when it comes.

## Rejected

- **A number from 0 to 100.** More room to tune, and more room to pretend to a precision
  that a hand-set number does not have.
- **Ordering by date alone.** Honest, and it makes the first row a list of whatever is
  soonest rather than whatever is worth going to.
- **Exposing the tier in the API and letting the client sort.** It would put a private
  editorial judgment about named people one browser inspector away.
