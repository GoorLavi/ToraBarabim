# 0001: Lessons are entered by administrators, not the public

- **Status:** accepted
- **Date:** 2026-08-14
- **Decided by:** project owner

## Context

A listings site lives or dies on whether the listings are true. Someone who travels
across town to a lesson that was cancelled, or never existed, does not come back. The
obvious way to fill a directory quickly is to let anyone submit a lesson.

## Decision

Only administrators create and edit listings. There is no public submission form and no
public account of any kind.

## Consequences

- Growth is limited by how fast a small group can type. Coverage will be narrow at
  first, and the empty state on the public site therefore has to do real work rather
  than treat "no results" as an edge case.
- There is no moderation queue, no spam handling, and no reporting flow to build.
- The public API is read-only. Every write path sits behind the admin guard.
- A rabbi or a community that wants to be listed has to reach a human. There is
  currently no route for that other than the contact details on the site.

## Rejected

- **Public submission with moderation.** Fills the directory faster, but builds a
  moderation product before the listing product exists, and one wrong listing that slips
  through costs more trust than ten missing ones gain.
- **Submission by verified rabbis only.** Same moderation cost plus an identity problem
  we have no way to solve.
