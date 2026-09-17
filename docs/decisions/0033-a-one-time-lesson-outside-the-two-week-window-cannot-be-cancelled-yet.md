# 0033: A one-time lesson outside the two-week window cannot be cancelled yet

- **Status:** accepted, to be fixed in its own change
- **Date:** 2026-09-17
- **Decided by:** project owner

## Context

Both surfaces that let someone act on a single date read the same list: a lesson's
recurrence expanded over a fixed window of fourteen days counting today. The rabbi's own
`GET /v1/rabbi/occurrences` has shipped that way, and the admin's new
`GET /v1/admin/lessons/:lessonId/occurrences` reuses the same constant deliberately, so
the two can never quietly disagree on how far ahead they look.

A weekly lesson always has a date inside that window, so nothing is out of reach. A
one-time lesson does not: if it is dated more than thirteen days out, it produces no
occurrence at all, and a date that does not appear cannot be cancelled or moved. The
rabbi cannot cancel his own; the admin cannot do it for him. Both have to wait until the
lesson is less than two weeks away.

The clean fix is small and known: a shared helper that widens the window to the lesson's
own date when the recurrence is one-time, used by both endpoints. Two lines on the admin
side. The rabbi's endpoint expands every one of his lessons against one shared range and
bounds a single exceptions query by it, so a per-lesson window there means computing the
widest range across his lessons first, then filtering each expansion by its own. Still
one query, about twenty more lines.

## Decision

The gap ships as it is, identical on both endpoints, and is fixed in its own change that
touches the two together. The round that added the admin surface does not quietly change
the behavior of an endpoint that is already in review.

## Consequences

- **A one-time lesson more than two weeks out cannot be cancelled or moved by anyone**,
  through any interface, until it comes inside the window. The date has to be deleted or
  the lesson edited instead, which is a different action with different consequences.
- Nobody is told this in the interface. Someone looking for a date they know exists sees
  a list that simply does not contain it.
- The two endpoints stay identical, which is what makes the later fix one change rather
  than two divergent ones.

## Rejected

- **Fixing it inside the round that added the admin surface:** it would change a shipped
  endpoint's behavior as a side effect of a change about something else, in a pull
  request already open for review.
- **Widening the window for everyone:** the two weeks is a product choice about what
  "what is coming up" means, and a longer list is a calendar rather than a glance. The
  problem is one-time lessons specifically, not the span.
- **Leaving it undocumented:** it is a known gap with a known fix, and the next person to
  find it would spend the diagnosis again.
