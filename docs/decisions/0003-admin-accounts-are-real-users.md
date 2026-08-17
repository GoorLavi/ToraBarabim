# 0003: Admins are real accounts, created by a script

- **Status:** accepted
- **Date:** 2026-08-14
- **Decided by:** project owner

## Context

The admin panel needed a way in. For a small trusted group, a single shared password in
an environment variable is the cheapest thing that works.

## Decision

Each administrator is a real account: `admin_users` with a scrypt password hash, and
`admin_sessions` holding a hash of the session token. Login sets an httpOnly cookie and
is rate limited. The first account is created with `npm run admin:create -w server`.
There is no signup page and there will not be one.

Every administrator can do everything. Roles were considered and deliberately skipped.

## Consequences

- Removing a person's access means deactivating one account, not rotating a secret that
  everyone else is also using.
- The session lives in the database, so logging out genuinely ends it and a stolen
  cookie can be killed.
- A forgotten password is resolved by someone with server access running the script.
  There is no email reset flow, which is acceptable at two or three users and becomes
  annoying beyond that.
- Because every admin can do everything, every admin can also trigger the destructive
  delete in `0004`. The confirm flag is the only guard, and it is the same for everyone.
- There is no record of who changed what. An audit log was considered and deferred; the
  seven day database backup is currently the only way to answer that question, and it
  answers it badly.

## Rejected

- **One shared password.** Cannot be revoked for one person, cannot distinguish who
  acted, and ends up in a chat message within a week.
- **A hosted identity provider.** More setup and another bill than three accounts
  justify.
- **Roles now.** Real, but speculative before there is a second kind of administrator.
  Adding them later does not break anything already built.
