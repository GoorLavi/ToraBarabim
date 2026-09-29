# 0039: A course entered by an administrator may have no rabbi and no place

- **Status:** accepted
- **Date:** 2026-09-24
- **Decided by:** project owner

## Context

Every lesson belongs to a rabbi and happens at a venue. Some courses the owner wants
to list are given by someone who is not on the site, or by an institution, and some
have a city but no fixed address yet.

## Decision

A course has one of two teacher shapes: linked to a rabbi on the site, or a free-text
teacher name. It has one of two venue shapes: a place on the site, or a city with an
optional address. Only an administrator can create the unlinked shapes. A rabbi's own
course is always linked to that rabbi.

The schema holds both unions as CHECK constraints, so a row with both a rabbi and a
free-text teacher, or with neither, cannot be stored.

## Consequences

- A course is the first entity on the site that may be attached to neither of its two
  core identities. It then appears on the home row and in the women's area, and on no
  rabbi's or place's page.
- An unlinked course has no owner account. Only an administrator can edit, close or
  delete it.
- The guards that depend on a rabbi's record do not fire on it:
  [0041](0041-an-unlinked-course-names-its-teacher-in-free-text.md).

## Rejected

- **Creating a rabbi record for every outside teacher.** It would fill the rabbis list
  with people who teach nothing else on the site.
- **Linked courses only.** It would keep out the courses the owner most wants to list
  first.
