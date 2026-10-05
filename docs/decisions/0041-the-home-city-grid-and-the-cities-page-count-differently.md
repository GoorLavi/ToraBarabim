# 0041: The home city grid and the cities page count lessons differently, for now

- **Status:** accepted
- **Date:** 2026-10-05
- **Decided by:** project owner
- **Related:** [0040](0040-the-home-page-carries-up-to-ten-interleaved-rows.md)

## Context

The home page's city grid now shows a lesson count beside each city. The cities page
(`/cities`) already shows a count, built differently in `server/src/service/city/city.ts`.
Aligning the two would widen this change into the cities page.

## Decision

The home grid counts distinct lessons with at least one scheduled occurrence in the next
fourteen days, general scope, and says `בשבועיים הקרובים` once under its heading. The
cities page keeps counting every lesson record, with no time window. The same city can
show two different numbers on the two pages. This is a gap accepted on purpose.

## Consequences

- A visitor who compares the two pages sees numbers that disagree, usually higher on
  the cities page.
- Closed by giving the cities page the home grid's definition in its own change.

## Rejected

- **Counting occurrences on the home grid**, as the women's area does: a weekly lesson
  counts twice in two weeks, which over-claims on a chip that reads "{n} lessons".
- **Aligning the cities page in this change**: correct, but out of the approved scope.
