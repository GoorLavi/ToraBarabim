# 0031: The import agent writes to production with its own key, without a per-run approval

- **Status:** accepted
- **Date:** 2026-09-15
- **Decided by:** project owner

## Context

Until now agents only read production, as their own read-only identity
([0021](0021-agents-read-aws-as-their-own-identity.md)), and never reach the database
([0028](0028-agents-never-reach-the-production-database.md)). The weekly import
([0030](0030-weekly-agent-imports-scraped-lessons.md)) needs an agent to write lessons
every week while the owner is not watching.

## Decision

The import agent holds one machine key, `IMPORT_AGENT_KEY`, in the owner's Mac
environment and the server's secret store. It opens only `/v1/agent/imports` and nothing
else; an admin session does not open those routes. Without the key configured, the
routes do not exist. The agent never touches the database. A run applies without the
owner approving it; he is asked only about names the server cannot place and about
withheld deletions.

## Consequences

- **The server cannot tell whether the owner really confirmed a decision.** It trusts
  the key. The limits are structural: the key can only submit rows and decisions, and
  the server's fixed rules decide every write.
- **The agent reads other people's websites and holds a write key.** Text on a site that
  tries to steer it can at most shape the rows it submits; deletions stay behind the
  zero-row, sharp-drop and ten-deletion guards.
- A leaked key lets someone submit rows as the import until it is rotated.
- Creating the production key is the owner's step; agents cannot.

## Rejected

- **Reusing an admin login for the agent:** a password in an agent's hands, and far
  more reach than the import needs.
- **Asking the owner to approve every run:** the weekly involvement he wants gone.
