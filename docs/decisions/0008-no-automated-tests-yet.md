# 0008: No automated tests yet, deliberately and temporarily

- **Status:** accepted
- **Date:** 2026-08-14
- **Decided by:** project owner

## Context

The project is young and the shape of the domain is still moving. Tests written against
a shape that changes weekly get deleted rather than run.

## Decision

No automated tests for now. The TypeScript compiler is the only automated guard.
Verification means: it type checks, it starts, and someone exercised the path by hand.

Claims must match that exactly. "It works" means those three things and nothing more. A
screenshot proves the design is right, never that the code is correct.

## Consequences

- **Nothing catches a regression.** Every change is verified by hand or not at all.
- Building the admin panel found six real defects by hand that all type checked cleanly,
  including a script that silently created an account nobody could log into. That is the
  cost of this decision, observed rather than theorised.
- Automatic deploys from `main` (see `0006`) mean an unnoticed regression reaches the
  public. The gap between the two decisions is real and is being accepted knowingly.
- Anyone tempted to assert something and finding nowhere to assert it should say so.
  That is the signal that this decision is due for reversal.

## What would change this

Enough settled behaviour to be worth protecting. The recurrence expansion, the date
range logic, and the exception shape rules are pure functions with real edge cases and
are the natural first targets: they need no database and no network to exercise.

## Rejected

- **Full test coverage from the start.** Slower now, and most of it would be rewritten as
  the domain settles.
- **Tests only for the admin API.** Tempting after six defects, but the API is thin
  routing over a database; the logic worth protecting is elsewhere.
