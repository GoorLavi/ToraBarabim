# 0046: Deleting a rabbi deletes their courses

- **Status:** accepted
- **Date:** 2026-09-25
- **Decided by:** project owner

## Context

[0004](0004-deleting-cascades-deliberately.md) decided that deleting a rabbi destroys
their lessons, behind a confirmation that names what will go. Courses are a new entity
linked to a rabbi, and the same question had to be answered for them.

## Decision

Deleting a rabbi deletes every course linked to them, open or closed, with its gallery
rows, in the same transaction as the lessons. The storage objects are removed after
the transaction commits. The confirmation dialog counts the courses along with the
lessons and the exceptions, and follows the rabbi's honorific.

## Consequences

- This is destructive and cannot be undone. A closed course, kept as a record of a
  cycle that ran, goes with the rabbi.
- A course page that was shared by link answers 404 afterwards.
- If removing a storage object fails after the commit, the object is left behind in the
  bucket. The rows are already gone.

## Rejected

- **Turning the courses into unlinked ones.** A course would stay on the site naming a
  teacher the owner just removed.
- **Refusing to delete a rabbi who has courses.** It was rejected for lessons in 0004
  for the same reason: the administrator would delete them one by one and then the
  rabbi.
