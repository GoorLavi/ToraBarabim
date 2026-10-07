# 0063: The growth agent reads Mixpanel through a read-only service account

- **Status:** accepted
- **Date:** 2026-10-07
- **Decided by:** goorlavi
- **Refines:** [0024](0024-visits-are-measured-by-mixpanel-full-tracking-no-consent-banner.md)

## Context

A campaign that nobody measures teaches nothing, and the owner asked that the loop
close without him pasting numbers by hand. Until now no agent could read Mixpanel: the
only credential in the project is the browser token, which writes events and reads
nothing.

## Decision

- **A Mixpanel service account with the Analyst role**, created by the owner in the
  project's settings, is the growth lane's read side. Its three values live in the
  root `.env` under `MIXPANEL_PROJECT_ID`, `MIXPANEL_SERVICE_ACCOUNT_USERNAME`, and
  `MIXPANEL_SERVICE_ACCOUNT_SECRET`, and nowhere else.
- **The only path to those values is `scripts/mixpanel-query.sh`**, which runs one
  segmentation report against the EU query host. The growth agent calls the script;
  it never writes its own request, so the secret never appears in a command line, a
  log, or a report.
- **Read only.** The account can run reports and nothing else. If a write is ever
  needed in Mixpanel, it is the owner's, by hand.
- **The retro is written from the script's output**, one campaign at a time, and the
  lesson the owner approves goes into `marketing/playbook.md`.

## Consequences

- One more secret in `.env`, named in `.env.example`, absent from the repository.
- The script fails at start when a variable is missing, which is the expected outcome
  in a sandbox and in a worktree before `setup-worktree.sh` has copied `.env`.
- A report that needs more than one segmentation call is several calls, each through
  the script; the script does not grow a query language.

## Rejected

- **The owner pastes numbers.** Works, but the retro then depends on his evening, and
  the number cannot be re-read when a question comes up.
- **Giving the agent the Mixpanel MCP server or raw `curl`.** More capable, and the
  credential would then sit in a tool configuration or a command the agent types.
