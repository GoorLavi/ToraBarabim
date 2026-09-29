# 0044: A course has one date, closes for good, and stays listed for a week

- **Status:** accepted
- **Date:** 2026-09-25
- **Decided by:** project owner

## Context

A lesson recurs and is expanded into occurrences. A course runs for weeks, and what a
visitor needs to know is whether they can still join. Listing every meeting would have
meant a second recurrence engine for information nobody asked for.

## Decision

A course carries one date, its opening, and a number of weeks and of sessions. It has
no list of meetings and no weekly time.

Registration is in one of three states: open, full, closed. It closes on the opening
date, or at opening plus the weeks when the lister allows joining after the start, or
earlier by hand. "Full" is set by hand. Closing and full are final: there is no reopen.

A closed or full course stays on every list it was on for seven days, shown with its
state, and then leaves them. Its own page stays reachable by link, marked closed and
out of search engines. A close by the calendar is computed from the dates, in Israel
time, and never stored; only a close by hand and "full" are written to the row.

## Consequences

- A course that changes its day or skips a week cannot say so, except in its
  description.
- A lister who closes by mistake cannot undo it. The way forward is a duplicate
  ([0045](0045-a-closed-course-is-read-only-and-the-next-cycle-is-a-duplicate.md)).
- Closed pages accumulate. Nothing removes them but a delete.
- The home row can show a closed course for a week. The owner asked for the closed
  state to be designed as a state, not as a greyed card.

## Rejected

- **A schedule of meetings.** A second recurrence engine, and a promise the site would
  then have to keep accurate.
- **Removing a course the moment it closes.** A link shared yesterday would dead-end.
- **A reopen action.** It makes "closed" mean nothing on a page people were sent to.
