# Reviewer Golden Set

Fixed test cases for the verdict-giving agent, `tora-reviewer`. Their purpose: when
someone edits the reviewer's prompt, prove it still catches what it used to catch. A
prompt "improvement" that silently makes the reviewer miss a bug class is a regression;
these cases catch it.

## Structure

```
evals/
  reviewer/
    case-01-bare-rabbi-name/    input.diff + expected.md
    case-02-physical-css/       input.diff + expected.md
    case-03-empty-search-404/   input.diff + expected.md
```

Each case is a synthetic diff (`input.diff`) plus the findings the agent **must** flag
(`expected.md`). The diffs are fixtures, not real repo code: file paths inside them may
not exist in the repo, and that is fine; the agent judges the diff itself. Each one is a
bug this project actually shipped, reduced to the smallest diff that still contains it.

## How to run

For each case, dispatch `tora-reviewer` on `input.diff` **without showing it
`expected.md`**:

> Review this diff against the house rules. The diff is a standalone fixture; judge it
> as-is, do not look for these files in the repo.

Then compare the agent's findings to `expected.md`:

- **PASS**: every expected finding is flagged, at blocking severity.
- **FAIL**: any expected finding is missing or demoted to optional polish.

Extra findings beyond the expected ones are fine.

## When to run

Before ratifying **any** edit to `.claude/agents/tora-reviewer.md`. The result is
presented at ratification together with the proposed edit, and the human reads both.

## Adding a case

A good case is a real miss that happened, or nearly happened, reduced to the smallest
diff that still contains it. Add the folder, the `input.diff`, and an `expected.md`
listing the must-catch findings, one line each: rule broken, where in the diff, why it
matters. The orchestrator proposes a new case when a new class of miss shows up in real
work; the human ratifies it.
