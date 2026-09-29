# 0037: Courses launch free and self-serve, with saving and publishing kept apart

- **Status:** accepted
- **Date:** 2026-09-24
- **Decided by:** project owner

## Context

Courses are meant to become a source of income for the site. Nothing about the paid
tier is decided yet: not the price, not who pays, not when. Building the listing first
and the charge later is only cheap if the first version leaves room for it.

## Decision

A course is free to list now. A rav or a rabbanit enters it in their own panel and it
appears on the site at once, with no approval queue, exactly like a lesson
([0015](0015-rabbis-manage-their-own-listings.md)). An administrator can enter one too.

Saving a course and publishing it are two separate facts in the schema: `courses` has
a `published` column that is always true today and has no writer. A future payment
gate adds a writer to that column. It does not add a migration.

## Consequences

- A future charge is expected to bind only the rabbi's own path. An administrator's
  entry, which may be linked to nobody, has no one to bill.
- Every public read must filter on `published`, including the ones written before any
  course is ever unpublished. A read that forgets it will show unpaid courses the day
  the gate arrives.
- The site still takes no payment. This record does not decide that it ever will.

## Rejected

- **Charging from the first day.** Nothing to charge for until rabbis have seen the
  listing work.
- **Adding the column when the paid tier arrives.** It would mean a migration and a
  sweep of every read at the moment the change is already risky.
