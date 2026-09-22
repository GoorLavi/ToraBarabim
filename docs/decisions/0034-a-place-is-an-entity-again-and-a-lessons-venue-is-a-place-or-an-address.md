# 0034: A place is an entity again, and a lesson's venue is a place or an address

- **Status:** accepted
- **Date:** 2026-09-22
- **Decided by:** project owner
- **Supersedes:** [0016](0016-a-venue-is-a-field-of-the-lesson.md)

## Context

[0016](0016-a-venue-is-a-field-of-the-lesson.md) deleted the `places` table because
nothing in the product managed it and a missing venue could block a rabbi from entering
his own lesson. It named the price at the time: the same synagogue is spelled once per
lesson, two lessons in one building can disagree about its name, and "all the lessons at
this synagogue" would need the identity we had just removed.

That last line is now the request. A synagogue, a yeshiva, a beit midrash is a thing
people look for by name: it has a door, a photo, and a regular week of lessons that
belong to it rather than to any one rabbi. It also has someone who runs it, and that
person is the right person to keep its listings correct.

## Decision

A **place** (מקום) is an entity with its own row, its own public page, its own listing in
the directory, its own profile in a panel, and credentials the administrator creates. Its
profile holds its name, its exact address and a photo.

A lesson's venue is one of exactly two shapes, never a mixture:

- **a place**: the lesson points at a place row and reads its name and street off it;
- **an address** (כתובת): the lesson carries the free-text venue of 0016 unchanged.

In the rabbi and admin panels the venue field offers both: pick a place from a list, or
fill the address in by hand. Places are only ever chosen from the list, never created
from the lesson form. Choosing a place clears and locks the address fields; clearing the
place unlocks them and the person types an address exactly as before.

A place signs in through the **rabbi** login, not a third one. Administrators keep their
own.

A place is never deleted, only deactivated. A deactivated place drops out of the
directory, its own page answers 404, and a lesson still pointing at it resolves to that
place's last-known name and street as a plain address, with no link.

## Consequences

- **0016's core guarantee survives.** Nobody is blocked by a missing place: the address
  arm is always available and is exactly what 0016 shipped. This record adds a shape, it
  does not take one away.
- **Two arms is two of everything to keep honest.** The wire type is a discriminated
  union and `lessons_venue_shape` is the matching CHECK, so a row with both a place and a
  typed street is one Postgres will not store.
- **The lesson's city is denormalized on purpose, and the compiler cannot protect it.**
  `lessons.city_code` stays on the row even for a place-backed lesson, because it is the
  only SQL narrowing on the public search's hot path and a join would make every city and
  area filter non-sargable. `lessonVenueColumns` is the one function allowed to set those
  columns, but nothing in the type system or in any CHECK can force a future writer
  through it: a CHECK cannot read another table. The only net under that gap is a test
  asserting that no lesson's `city_code` disagrees with its place's.
- **A place's name and street are read through the join, never copied**, so correcting a
  place corrects every lesson at it. The cost is that a lesson's historical address is
  not preserved: move the synagogue and last month's lesson shows this month's street.
- **A third kind of account signs in.** The rabbi login now resolves to a rabbi or to a
  place, so every screen behind it has to know which. Sharing the login was the owner's
  call, against a third login page, because people already sign in there.
- **`places` is a table the product now has to keep clean**, which is exactly what 0016
  removed. It is affordable this time only because the administrator creates every row: a
  rabbi cannot add a near-duplicate of a building that already exists.
- **A place's opening hours are not built.** The profile carries the address and the
  photo only. What the site shows about when a place is open is its lessons; a separate
  hours field would be a second, hand-maintained answer to the same question, and the
  first one to go stale. It gets built when someone asks for a place to say it is open
  outside its lesson times.

## Rejected

- **A third login page, for places.** The owner's own reversal: people already sign in at
  the rabbi login, and a site with three sign-in URLs makes the person guess which one is
  theirs. Merging places into the *administrator* login was rejected for the opposite
  reason: an administrator can see everything, and a place must not.
- **Letting a rabbi create a place from the lesson form.** This is the failure 0016
  documented, and nothing about it changed: the table fills with three spellings of one
  building and someone inherits the merging.
- **One venue shape with optional fields plus a `placeId`.** A bag of optionals with a
  flag cannot be constrained: nothing stops a row carrying both a place and a typed
  street, and then no reader knows which one is true.
- **Copying a place's name and street onto the lesson at save time.** It would preserve
  history, and it would silently reintroduce 0016's drift, which is the thing this record
  exists to fix.
- **A scheduled check for lessons whose address drifted from their place.** Proposed and
  withdrawn: with the join there is nothing to drift, so the check would have had nothing
  to find.
- **A hard delete for a place.** It either orphans lessons or forces the administrator to
  move every one of them before a building can be removed. Deactivation gives the same
  outcome on every public surface with neither cost.
