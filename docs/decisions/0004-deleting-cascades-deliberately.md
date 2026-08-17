# 0004: Deleting a rabbi or place destroys their lessons

- **Status:** accepted
- **Date:** 2026-08-14
- **Decided by:** project owner

## Context

A rabbi has lessons; a place hosts them. Deleting either leaves those lessons pointing
at something that no longer exists. The three options were to block the delete, to hide
the record instead of removing it, or to delete everything together.

The recommendation at the time was to block the delete and make the administrator remove
the lessons first. The project owner chose the cascade anyway, after being told it is
irreversible.

## Decision

Deleting a rabbi deletes their lessons, those lessons' exceptions, and any exception
naming them as a substitute. Deleting a place does the same for the lessons held there
and any exception overriding to it. All of it runs in one transaction.

Two guards, both required:

1. `GET /v1/admin/{rabbis,places}/:id/delete-preview` returns how many lessons and
   exceptions would be destroyed.
2. `DELETE` without `?confirm=true` returns 409 with those counts and changes nothing.

## Consequences

- **A mistake is permanent.** There is no undo, no recycle bin, and no soft delete. The
  only recovery is a database restore, which loses every change made since.
- This is why the production database keeps seven days of point in time backup. That
  backup is not a nice-to-have here; it is the entire safety net.
- The UI must show the preview counts before it asks for confirmation. A confirm dialog
  that does not say "this will delete 14 lessons" defeats the guard.
- Do not quietly convert this to a soft delete later. It was chosen with the cost
  understood. Changing it is a new decision record.

## Rejected

- **Block the delete while lessons reference the record.** Safest, and what was
  recommended. Rejected as too much friction for the person doing the data entry.
- **Soft delete.** Recoverable, but every query everywhere then has to remember to
  filter, and the first one that forgets shows deleted rabbis to the public.
