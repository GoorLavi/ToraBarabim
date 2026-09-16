# 0032: The import matches rabbis by name and site, and learns only what the owner confirmed

- **Status:** accepted
- **Date:** 2026-09-15
- **Decided by:** project owner

## Context

The collected rows name a rabbi as the site writes it, "הרב יגאל כהן", and we have two
different rabbis by that name, each on a different site. The owner wants each match made
once and remembered, and wants the agent to learn from his answers rather than ask again.

## Decision

- **A (name, site) pair is linked to one rabbi once, and the link wins from then on.**
  A new pair whose name equals exactly one of our rabbis' names links automatically and
  is listed in the weekly summary. Two or more candidates, or none, is a question to the
  owner; his answer is remembered for that site only.
- **Learning is data the owner approved, in two homes:** facts about a site the page does
  not state (a missing day, a missing address) in the collector's `source-facts.md` in
  the repository; name links and wording rules (a city spelling, a time kind, an audience
  or topic wording) in the database. A learned rule never overrides a built-in one.
- **The import deals with rabbis only, never rabbaniyot.** A row naming "הרבנית" is
  skipped with its reason; a rabbanit is never a candidate, a link target, or created by
  the import. Her lessons are entered by hand, under
  [0026](0026-rabbaniyot-teach-women-only-and-the-honorific-is-a-field.md).
- **Duplicates, protection of hand edits and deletion never learn.**

## Consequences

- The owner decides only between namesakes and new names, once per site.
- **A new rabbi who shares the name of our only rabbi by that name is linked to the wrong
  one automatically**, until someone notices it in the summary. Accepted as rare.
- A remembered link or rule has no editing screen; a wrong one is fixed in the data.
- Links are per environment: the local trial's links do not carry to production.

## Rejected

- **Our rabbi id written into the file by the collector:** exact, and it makes the owner
  keep a list in his tool current for every new rabbi.
- **Matching by name alone across sites:** both "יגאל כהן" sites would go to one rabbi.
- **Letting the agent infer rules on its own:** its behaviour would drift without anyone
  having agreed to it.
