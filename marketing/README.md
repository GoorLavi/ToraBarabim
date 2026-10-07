# Marketing

Everything the marketing lane produces lives here: campaign plans, copy, creative, and
what past campaigns taught. The lane itself (who does what, and how
a campaign moves from idea to posted) is described in [.claude/README.md](../.claude/README.md);
the owner's standing choices about audience and budget are in
[0061](../docs/decisions/0061-the-site-advertises-to-seekers-first-through-rabbis-own-clips.md).

## Layout

```
marketing/
  README.md          this file
  voice.md           what an ad says and never says, read by every agent that writes a line
  playbook.md        what worked and what did not, one line per lesson, updated after each retro
  raw/               raw footage, never committed
  campaigns/<slug>/
    plan.md          the approved plan, written by the orchestrator at the plan gate
    copy.md          the copywriter's variants, one marked recommended
    creative/        exported stills and the closing card (PNG, PDF), committed when small
    video/           rendered clips and frame grabs, never committed
    retro.md         the growth agent's read of the numbers, after the campaign ran
```

Plans, copy, checklists, and retros are written in Hebrew: the owner reads and acts on
them, so they are conversation, not code. File names, source values, and event names
stay exactly as they are in the code.

## Accounts the owner holds

Updated by the owner when it changes; the strategist's checklist starts from this list,
so a plan never assumes an account that does not exist.

| Platform | State on 2026-10-07 |
| --- | --- |
| Facebook | A page exists. No ad account |
| TikTok | An account exists. No ad account |
| Instagram | None |
| Meta ads (Facebook and Instagram) | No ad account; opening one is the owner's first step before any paid asset |

## What is not here

- Nothing is posted from this folder. Posting, boosting, and the ad account are the
  owner's hands; the plan ends with the checklist the owner follows.
- Numbers come from Mixpanel through `scripts/mixpanel-query.sh`, never pasted from a
  dashboard by hand
  ([0062](../docs/decisions/0062-the-growth-agent-reads-mixpanel-through-a-read-only-service-account.md)).
- Raw footage and rendered video are too large for git and are listed in `.gitignore`.
