# 0028: Agents never reach the production database

- **Status:** accepted
- **Date:** 2026-09-15
- **Decided by:** project owner
- **Builds on:** [0021](0021-agents-read-aws-as-their-own-identity.md), which made an
  agent's AWS identity read-only, and [0011](0011-deploys-are-automatic-migrations-are-not.md),
  which kept migrations in human hands

## Context

The production database is reachable from a laptop through one path: a Systems Manager
tunnel opened by `infra/scripts/db-tunnel.sh`, which needs the owner's AWS profile.
[0021](0021-agents-read-aws-as-their-own-identity.md) took that profile away from
agents, so the tunnel was already unreachable in practice. But the rule against applying
migrations was text only, and the shared local database has already been migrated from
the wrong folder once (2026-08-22) with a command that reported success.

The agent harness now has hooks that read the text of every shell command before it
runs. That made it cheap to turn two written rules into mechanical blocks.

## Decision

**Two hooks, both fail closed.** `guard-migrate.sh` blocks `db:migrate`,
`drizzle-kit migrate`, and `drizzle-kit push`; `guard-production-db.sh` blocks
`db:tunnel`, the tunnel script, and `ssm start-session`. A `permissions.deny` list in
`.claude/settings.json` carries the same commands as a second layer. Both match the
command's text, like the AWS profile hook: a command that merely quotes one of these
words is blocked too.

The agent's side of a schema change is the `create-migration` skill: edit the schema,
generate the SQL, hand the apply step to the human with the folder to run it from.

## Consequences

- A false block costs a rewording. An agent cannot echo, grep for, or write a commit
  message containing `db:migrate` without splitting the word. That is the intended
  trade; the alternative is a guard that can be talked around.
- Local migrations are now always the human's step, even in a throwaway worktree. The
  skill's hand-off names the folder, because that is where the 2026-08-22 mistake was.
- If production data is ever needed for a diagnosis, the query is handed to the owner.
  There is no agent path to it and none is planned.

## Rejected

- **Leaving the rules as text.** They were text for three months and were followed,
  but a rule that only holds while the agent remembers it is not a guard. The hook
  costs nothing to keep.
- **Blocking only the npm script and not the underlying `drizzle-kit`.** The Why's
  harness closed exactly that gap after finding it (`db:migrate` was blocked, `prisma
  migrate` was not). Both spellings are blocked here from the start.
