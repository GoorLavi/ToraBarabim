# 0020: One super admin gates admin management

- **Status:** accepted
- **Date:** 2026-09-08
- **Decided by:** project owner
- **Supersedes:** the "no roles or tiers among admins" part of
  [0018](0018-admins-can-create-admins.md)

## Context

[0018](0018-admins-can-create-admins.md) let any admin create, deactivate, and (as of
the same change that produced this record) delete and reset the password of any other
admin, and explicitly rejected roles or tiers among admins as "still speculative before
there is a second kind of admin." There is now a second kind: the project owner asked
that the admin-management screen itself (creating, listing, deactivating, deleting, and
resetting the password of admin accounts) be restricted to a single, permanent "super"
admin, so that an ordinary admin can no longer touch other admins' accounts at all.

## Decision

`admin_users` gains an `is_super` column. Exactly one row may ever have it set, enforced
by a partial unique index in Postgres, not just by convention: this is a real database
invariant, the same way `rabbiId`'s nullable-unique constraint already enforces "at most
one account per rabbi."

- Every route under `/v1/admin/admin-users` (list, create, deactivate/reactivate,
  delete, reset password) now requires the caller's own session to be the super admin.
  A non-super admin gets a 403, both from the API and, in the client, by the whole
  "Admins" section being hidden and its routes blocked.
- A super admin can never be deactivated or deleted, by anyone, regardless of their own
  or the target's active state. This check is independent of, and in addition to, the
  existing "cannot deactivate/delete yourself" and "must be deactivated before deletion"
  guards.
- There is no in-app way to become super, transfer it, or promote a second admin to
  super. The only mechanism is a new, deliberately narrow CLI script,
  `npm run admin:promote-super -w server -- <email>`, which sets the flag on an existing
  admin's row and refuses outright if any row already has it set. It never reassigns or
  demotes; running it a second time, ever, is a no-op error, not a transfer.
- Every other admin still does everything else [0003](0003-admin-accounts-are-real-users.md)
  already granted: lessons, rabbis, rabbi accounts. Only the admin-management surface
  itself is gated.

## Consequences

- **The whole "any admin can manage admins" model 0018 shipped an hour earlier in the
  same session is gone.** Ordinary admins can no longer bring on, deactivate, delete, or
  reset the password of another admin; only the one super admin can.
- **The super admin becomes a single point of failure for admin management itself.** If
  that person is unreachable, no other admin can create, deactivate, or clean up admin
  accounts, even though they can still do everything else. This is accepted as the cost
  of "exactly one, permanent," the same way [0019](0019-lower-the-admin-password-minimum-and-drop-the-bootstrap-script.md)
  already accepted no bootstrap/recovery path for the first admin at all.
- **Assigning super still depends on server access** (someone running the promotion
  script), the same dependency 0018 was written to get away from for ordinary admin
  creation. This is deliberate: the point of "exactly one, permanent" is that it is
  *not* meant to be a routine, in-app action.
- The promotion script's refusal to run a second time means recovering from "the super
  admin's account was deleted or lost" has no documented path either. Nothing in this
  change deletes a super admin's row through the API (that is exactly what is blocked),
  so the realistic way to hit this is direct database access, which is already outside
  what this project's tooling covers.

## Rejected

- **Multiple super admins, or a way to promote further ones in-app.** The owner asked
  for exactly one, permanently. A second tier of "regular super admins" who can promote
  others reintroduces the same "who can create an admin" question 0018 answered for the
  ordinary tier, one level up, with no stated need for it yet.
- **A transfer/reassignment path for the super flag.** Considered and explicitly
  declined: the script refuses rather than reassigns when a super already exists, so
  moving it (a departure, a compromise) is a deliberate, out-of-band, database-level
  action, not a feature.
- **Gating other admin actions (lessons, rabbis) behind super too.** Not asked for, and
  would reopen 0003's "every admin can do everything" for surfaces that were never in
  question here.
