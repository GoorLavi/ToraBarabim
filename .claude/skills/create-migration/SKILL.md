---
name: create-migration
description: The safe Drizzle migration sequence for ToraBarabim. Use whenever you change the database schema under server/src/db/. Edit the schema, generate the migration file, then hand the apply step to the human with the exact folder to run it from. Never applies a migration; a hook blocks it anyway.
---

# Create a Migration (the safe Drizzle sequence)

Changing the database means changing the schema under `server/src/db/`. This is the
exact order so the generated SQL matches the schema and nothing touches a database the
wrong way. The rules it follows (backward-compatible migrations, removals in their own
later deploy, migrations run from the worktree) live in `CLAUDE.md` under **Data and
Migrations** and **Worktrees**; this file is the sequence, not the rule.

## Who does what
- **Agent (you):** edit the schema and generate the migration file. That is all.
- **Human:** applies it locally, because it touches their local database.
- **CI:** applies migrations to production on merge to `main`, behind the
  `production-migrations` environment approval.

## The sequence
1. **Edit the schema** under `server/src/db/`, and any shared type that mirrors it.
2. **Generate the migration** from the repo root:
   ```bash
   npm run db:generate -w server
   ```
   This writes a new `server/drizzle/*.sql` and updates the journal. Read the SQL: it
   is what production will run. If it drops or renames something the live server still
   reads, stop; that is a two-deploy change, and the rulebook says how.
3. **Hand off the apply step.** Tell the human to run it and **name the folder**. The
   new SQL file exists only in your checkout, so from any other checkout the command
   applies nothing and reports success:
   ```bash
   cd <absolute path to the checkout holding the new server/drizzle/*.sql>
   npm run db:migrate -w server
   ```
   **Check `.env` exists there first.** It is gitignored, so a fresh worktree does not
   have one; `scripts/setup-worktree.sh` copies it. Say so in the hand-off when it is
   missing.
4. **Ask the human to confirm the effect in the database**, never from the command's
   output. Drizzle's own bookkeeping notices (`already exists, skipping`) look like a
   result and are not one.

## Never
- Never run `db:migrate`, `drizzle-kit migrate`, or `drizzle-kit push`. A hook blocks
  them; being blocked is the expected outcome, not a fault to work around.
- Never put a database URL in a command. The scripts read `.env`.
- If anything offers to **reset** or **drop** the database, refuse and report. It means
  the migration history and the database disagree, and the cause is a question for the
  human.

## After the migration is applied
- Confirm the code type-checks against the new schema:
  `npm run typecheck -w server`.
- If a shared type changed, the client type-checks too: `npm run typecheck -w client`.
