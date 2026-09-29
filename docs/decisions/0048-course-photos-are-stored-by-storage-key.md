# 0048: Course photos are stored by storage key, not by URL

- **Status:** accepted
- **Date:** 2026-09-25
- **Decided by:** tora-architect, approved by the project owner at the plan gate

## Context

[0005](0005-s3-compatible-storage-one-code-path.md) records that the schema stores an
image's public URL, and that cleanup derives the object's key from it. If the URL
format ever changes, cleanup stops matching and objects leak silently.

## Decision

The course tables store the storage key: `courses.cover_key` and
`course_photos.storage_key`. The public URL is built from the key when a response is
converted. Deleting and copying address the object by its key directly.

## Consequences

- A change to the bucket's public address changes one function, and every course
  photo follows.
- Rabbi and place images still store URLs. The two shapes live side by side until
  those tables are migrated, which this record does not schedule.
- A raw row is useless to a browser without the convertor, which is the rule anyway.

## Rejected

- **Storing the URL, like the older tables.** It would carry 0005's leak into a table
  that deletes and copies objects far more often than the others do.
