# 0015: A venue is a field of the lesson, not an entity

- **Status:** accepted
- **Date:** 2026-08-23
- **Decided by:** project owner

## Context

A lesson used to point at a row in a `places` table: a name, an address, and a city drawn
from the official locality list. Nothing in the product ever managed that table. There was
no places screen in the admin panel; the lesson form showed three plain fields and created
or updated a hidden `places` row behind the scenes.

So the table bought us nothing a listing site needs. Nobody browses venues, nobody needs a
venue to be recognised, and two lessons at the same synagogue sharing one row is a
property no screen ever used. What it did buy was a way for a person entering a lesson to
be blocked because their venue was not registered, which is intolerable once rabbis enter
their own lessons ([0014](0014-rabbis-manage-their-own-listings.md)).

The city is different. The home page's city grid, the city filter and the area filter all
depend on the city being a chosen code rather than typed text. `ירושלים`, `י-ם` and
`ירושלים ` are three cities to a database and one city to a person.

## Decision

The `places` table is gone. A lesson carries its own venue: a name, a street with house
number, an optional floor or arrival note, and a city code referencing `cities`.

The city stays structured and is chosen from the official data.gov.il list, exactly as
before. Everything else about the venue is free text.

A single-date override ([the exception model](../product.md)) carries the same four fields
and is all-or-nothing: a date either overrides the whole venue or none of it.

## Consequences

- Nobody is ever blocked from entering a lesson by a missing venue, which was the point.
- One screen fewer to build and one table fewer to keep clean.
- **The same synagogue is now spelled once per lesson.** Two lessons in one building can
  disagree about its name or its street, and nothing detects it. That is a real loss of
  the old shape, accepted because nothing in the product joined on venue identity anyway.
- Correcting a venue's name across several lessons means editing each one.
- **Every migrated lesson has an empty floor**, because the old table had no such column.
  Expected, not a defect.
- A venue-level page, or "all lessons at this synagogue", would need the identity we just
  removed. Nothing asks for it today; if something does, that is a new record and probably
  a different shape than the old table.

## Rejected

- **Free text for the city as well.** The simplest thing to fill in, and it kills browsing
  by city and by area, which is half of how someone finds a lesson near them tonight. This
  was the owner's first instinct and was reversed once the cost was named.
- **Keeping the table and letting a rabbi create a venue.** Fills the table with near
  duplicates of the same building and hands someone the job of merging them.
- **Keeping the table and blocking on a missing venue.** Stops a rabbi at the exact moment
  he is trying to help.
