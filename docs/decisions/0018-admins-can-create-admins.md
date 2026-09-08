# 0018: Admins can create admins from the panel

- **Status:** accepted; the CLI script named below as the bootstrap/recovery path is
  removed by [0019](0019-lower-the-admin-password-minimum-and-drop-the-bootstrap-script.md),
  which accepts the resulting gap; the "no roles or tiers among admins" part is
  superseded by [0020](0020-one-super-admin-gates-admin-management.md)
- **Date:** 2026-09-08
- **Decided by:** project owner
- **Supersedes:** the "created by a script" and "no signup page" framing in
  [0003](0003-admin-accounts-are-real-users.md)

## Context

[0003](0003-admin-accounts-are-real-users.md) held that an admin account is created by
someone with server access running a CLI script, and stated flatly that "there is no
signup page and there will not be one." That was right when the trusted group was one
or two people with server access. It stops covering the real need the moment an
existing admin wants to bring in another admin without anyone touching the server.

This is not the signup page 0003 rejected. Nobody self-registers: creating an admin
still requires an existing, authenticated admin session. It is a second, in-app way to
do the same thing the script does, not a public door.

Separately, both admin and rabbi accounts now support logging in with a username in
addition to email, required and unique whenever a new account is created, chosen by
whoever creates the account. Existing accounts, all created via the script, have no
username and keep logging in with email until someone sets one for them.

## Decision

An authenticated admin can create another admin from the admin panel, choosing that
new admin's name, email, required unique username, and password directly. The password is
never auto-generated for this flow, unlike a rabbi's account: the creating admin picks
it and hands it to the new admin out of band, the same way a rabbi's temporary
password is communicated today.

- The CLI script (`npm run admin:create -w server`) is unchanged: email + name only,
  no username. It remains the way to create the very first admin, and the recovery
  path if the admin panel itself becomes unusable.
- An admin cannot deactivate their own account from the panel, so nobody can lock
  themselves out this way. Deactivating the last remaining admin some other way is
  still possible and still recovered the same way 0003 already accepts: the script,
  run by someone with server access.
- Every admin can still do everything ([0003](0003-admin-accounts-are-real-users.md)'s
  "no roles" stands, [0015](0015-rabbis-manage-their-own-listings.md) notwithstanding:
  that record added the separate `rabbi` role, not tiers within `admin`).

## Consequences

- Bringing on a new admin no longer needs anyone with server access. It also means
  admin accounts can now be created by more than one person acting independently, with
  nothing recording who created whom beyond the seven day database backup 0003 already
  named as the (poor) answer to "who did this."
- A username is required and unique on creation, but unverified otherwise: nothing
  stops two admins from picking confusing or non-memorable usernames, and nothing
  checks that it means anything to anyone but its owner. It is a convenience, not an
  identity system.
- There is still no self-service password reset or change for an admin account. A
  forgotten password is still resolved exactly as 0003 describes: someone with server
  access re-runs the script's flow (against a different email, since the row already
  exists), or another admin creates a fresh account for them.

## Rejected

- **A public signup page, or invite links/email.** Exactly what 0003 rejected and for
  the same reason: this project's trusted group is still small enough that a person
  handing another person a password directly is cheaper and safer than building
  delivery for it.
- **Roles or permission tiers among admins.** Still speculative before there is a
  second kind of admin, same reasoning 0003 already gave. Every admin can still do
  everything.
- **Backfilling a username onto every existing account.** The column is nullable and
  login already falls back to email; forcing a one-time migration onto every existing
  account for a convenience field was not worth the exercise.
- **A "last active admin" guard.** Would need to know an admin's own status is the
  last one standing at deactivation time, adds real complexity, and the script already
  answers "everyone is deactivated" the same way 0003 answers "everyone forgot their
  password."
