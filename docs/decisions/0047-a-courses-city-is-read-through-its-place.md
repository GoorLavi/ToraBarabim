# 0047: A course's city is read through its place

- **Status:** accepted
- **Date:** 2026-09-25
- **Decided by:** tora-architect, approved by the project owner at the plan gate

## Context

A lesson at a place keeps its own copy of the city code
([0034](0034-a-place-is-an-entity-again-and-a-lessons-venue-is-a-place-or-an-address.md)),
so a search by city needs no join. The copy goes stale when a place's city is
corrected, and nothing updates it.

## Decision

A course at a place stores no city. Its city is the place's, read through a join. A
course with no place stores a city code of its own. A CHECK refuses a row that has
both a place and a city code.

## Consequences

- Correcting a place's city moves its courses with it, with no second write.
- Every read of a course's city joins to places. At the number of courses expected,
  that is free.
- Courses and lessons now answer the same question in two ways. The next person to
  touch either will ask why; this record is the answer. The stale copy on lessons is a
  known defect of its own.

## Rejected

- **Copying the city code, as lessons do.** It would give courses the defect that
  lessons already have.
