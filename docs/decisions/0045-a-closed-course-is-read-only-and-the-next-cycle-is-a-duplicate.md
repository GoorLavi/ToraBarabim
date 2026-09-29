# 0045: A closed course is read-only, and the next cycle is a duplicate

- **Status:** accepted
- **Date:** 2026-09-25
- **Decided by:** project owner

## Context

Courses repeat in cycles. Once one closes, the lister wants the next one to start from
the same description and photos. Editing the closed record's date would have reopened
it by the calendar and erased the record of the cycle that ran. The owner: "מבחינתנו
זה לוגים על קורסים מוצלחים".

## Decision

After registration closes, a course cannot be changed: no field, no cover, no gallery
photo. The server refuses with 409. It can be deleted, and it can be duplicated.

A duplicate is a new course with every field copied, a new opening date chosen at that
moment, and the cycle number set to the source's plus one. It owns copies of the
photos as storage objects of its own.

## Consequences

- A typo found after closing stays. Fixing it means deleting the course.
- Each cycle stores its photos again. At the expected volume the cost is noise
  ([0005](0005-s3-compatible-storage-one-code-path.md)).
- Deleting an old cycle cannot break a newer one's photos, which is why the copies are
  real.
- If a photo fails to copy, the duplicate is still created, and the lister adds the
  photo again.

## Rejected

- **Editing the dates of a closed course.** It reopens a record that was meant to be
  final.
- **Sharing photo objects between cycles.** Deleting one course would then have to know
  about every other.
