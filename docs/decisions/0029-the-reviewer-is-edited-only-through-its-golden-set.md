# 0029: The reviewer is edited only through its golden set

- **Status:** accepted
- **Date:** 2026-09-15
- **Decided by:** project owner
- **Builds on:** [0023](0023-the-public-pages-are-server-rendered.md), which brought
  the first automated checks, and the **Verification** rules that followed

## Context

Until now nobody reviewed code: the orchestrator verified by hand that a change
compiled, ran, and behaved, and nothing gave a verdict on the code itself. This change
adds `tora-reviewer`, an agent whose only output is PASS or FIX with findings.

An agent that gives verdicts is only as good as its prompt, and a prompt is edited by
whoever last had a reason to. An edit that reads as an improvement can silently make
the reviewer stop catching a bug class it used to catch, and nothing else in the
pipeline would notice: the change would pass review and ship.

## Decision

**The reviewer has a golden set, and no edit to its file is ratified without re-running
it.** `.claude/evals/reviewer/` holds three fixtures, each a bug this project actually
shipped, reduced to the smallest diff that still contains it: a rabbi's name shown
bare, physical CSS direction, and a 404 on an empty search. Each names the finding the
reviewer must flag at blocking severity. The result of the run is presented to the
human together with the proposed edit, and the human reads both.

A new class of miss in real work earns a new case, proposed by the orchestrator and
ratified by the human, so the same miss cannot come back silently.

## Consequences

- Editing the reviewer costs three dispatches. That is the price of trusting its
  verdicts.
- The set only proves what it contains. A reviewer that passes all three can still miss
  a fourth class; the set grows by misses, not by speculation.
- The fixtures are not real repo code and must not be "fixed" when they look wrong.
  They are wrong on purpose, in exactly one way each.
- The baseline was run on 2026-09-15, before this record was written: all three
  expected findings caught, at blocking severity.

## Rejected

- **A reviewer with no golden set**, edited freely like the builder agents. A builder's
  regression shows up as a broken build; a reviewer's regression shows up as a bug in
  production months later.
- **A guardian agent as a second opinion.** It would double the review cost on every
  change to catch what a three-fixture run catches once per edit. The orchestrator
  checks the assembled result instead, which is enough with three builders.
