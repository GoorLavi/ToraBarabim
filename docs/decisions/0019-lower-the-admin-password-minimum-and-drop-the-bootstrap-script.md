# 0019: Lower the admin password minimum, and drop the bootstrap script

- **Status:** accepted
- **Date:** 2026-09-08
- **Decided by:** project owner
- **Supersedes:** the password-length and script-dependent parts of
  [0003](0003-admin-accounts-are-real-users.md) and [0018](0018-admins-can-create-admins.md)

## Context

[0018](0018-admins-can-create-admins.md) added a way to create an admin from the panel
itself, but kept the CLI script (`npm run admin:create`) as "the way to create the very
first admin, and the recovery path if the admin panel itself becomes unusable," enforcing
a 12-character minimum password everywhere one is chosen directly.

The project owner asked to lower that minimum to 6, and, once told that the CLI
script's own `ALLOW_WEAK_ADMIN_PASSWORD` escape hatch would become meaningless at that
point (its floor was already 6), asked to remove the script entirely rather than leave
dead code behind. Told plainly that the script was the only documented way to create a
first admin on a fresh database and the only recovery path if every admin account is
ever deactivated (see [4](../infra/README.md#4-create-the-admin-user) in `infra/README.md`,
which ran this exact script over ECS Exec in production), the owner chose to remove it
anyway and accept the gap.

## Decision

`MIN_PASSWORD_LENGTH` (`server/src/service/admin-auth/consts.ts`, mirrored in
`client/src/AdminPanel/AdminFormPage/consts.ts`) drops from 12 to 6, applied wherever an
admin password is chosen directly (currently: the admin-user creation endpoint).

`server/src/scripts/create-admin.ts` is deleted, along with its `admin:create` npm
script, its `ALLOW_WEAK_ADMIN_PASSWORD` / `WEAK_PASSWORD_FLOOR` escape hatch, the
`.env.example` entry for that variable, and the production runbook section in
`infra/README.md` that ran it over ECS Exec.

## Consequences

- **There is no longer any way to create the first admin account on a fresh database.**
  A brand new environment (a fresh local checkout, a new production stack) has an empty
  `admin_users` table and no admin session to reach `/admin/admins` with, and nothing
  else inserts a row. This is a known, accepted gap, not an oversight: closing it means
  building a new bootstrap mechanism (a one-time seed script, an idempotent migration,
  or an equivalent), which has not been designed or built as part of this decision.
- **There is no longer any recovery path if every admin account is deactivated or every
  password is lost.** Before this change, someone with server access could always fall
  back to the script. That fallback is gone; recovering now means restoring from a
  database backup, a manual `UPDATE` against production, or building the bootstrap
  mechanism named above, none of which existed as a supported procedure before this
  record.
- A 6-character minimum is a real weakening of what an admin password is allowed to be.
  Every admin still has full access to everything the admin role can do
  ([0003](0003-admin-accounts-are-real-users.md)), so a guessed or brute-forced admin
  password is a bigger loss than before at the same rate-limit protection
  ([0018](0018-admins-can-create-admins.md) did not change the login rate limit).
- `infra/README.md`'s numbered runbook now has a section that says plainly "there is no
  procedure here," rather than silently renumbering around a deleted step, so a human
  following it later does not assume the gap is an editing accident.

## Rejected

- **Keep the script, only its weak-password escape hatch.** Removes the immediate dead
  code (the escape hatch becoming a no-op once the real minimum matches its floor)
  without losing the bootstrap and recovery path. Offered explicitly and declined: the
  owner wanted the script itself gone, not shrunk.
- **Build a replacement bootstrap mechanism in the same change.** Would close the gap
  this record accepts, at the cost of designing and shipping a new piece of
  infrastructure as a side effect of a password-length tweak. Left for whenever the gap
  is actually hit, per the root rulebook's fail-open/fail-closed guidance: this is
  recorded as accepted-for-now, not solved.
