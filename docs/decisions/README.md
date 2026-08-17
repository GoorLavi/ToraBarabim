# Decisions

One file per decision. Each records what was chosen, why, what was rejected, and what
the choice costs us. Dated and numbered in the order they were taken.

## Why this folder exists

A rule in `CLAUDE.md` tells you what to do. It cannot tell you why, and it cannot tell
you which alternatives were already weighed and dropped. Without that, every choice gets
re-argued by whoever arrives next, and the ones that were deliberate become
indistinguishable from the ones that were accidental.

A decision record is also the only honest way to carry a choice that has a real cost.
"Deleting a rabbi destroys their lessons" is not a bug report and not a rule: it is a
decision with consequences someone must be able to find later.

## When to write one

Write one when a choice is **hard to reverse**, **costs something real**, or **someone
will reasonably ask "why is it like this?"**. In practice:

- A dependency, a service, or a piece of infrastructure we are now tied to.
- A rule about the product that is not obvious from the code.
- Anything destructive, anything about money, anything about who can do what.
- A gap we are accepting on purpose, with what would close it.

Do **not** write one for: a naming choice, a refactor, a bug fix, or anything the code
already states plainly. If the record would just restate the code, delete it.

## Format

Copy this shape. Keep it short: a decision nobody reads is not documented.

```markdown
# NNNN: Short title in the imperative

- **Status:** accepted | superseded by NNNN | reversed
- **Date:** YYYY-MM-DD
- **Decided by:** who actually made the call

## Context
What was true that forced a choice. Two or three sentences.

## Decision
What we chose, stated plainly.

## Consequences
What this costs, what it makes harder, what we now depend on. The honest part.

## Rejected
The real alternatives and why each lost. If there was no alternative, say so.
```

## Rules

- **Numbered and never renumbered.** `0007` stays `0007` forever, so a reference to it
  from code or another record keeps pointing at the same thing.
- **Never edited once accepted**, except to change `Status`. A decision that changes
  gets a NEW record that supersedes the old one, and the old one gains a
  `superseded by` line. Editing history in place is how a project forgets it ever
  thought otherwise.
- **English**, like all documentation here. Hebrew appears only when quoting copy that
  the user actually reads.
- **Link, do not copy.** If a rule follows from a decision, the rule lives in
  `CLAUDE.md` and the record links to it. The same sentence in two files will drift.

## Index

| # | Decision | Status |
| --- | --- | --- |
| [0001](0001-lessons-are-admin-entered.md) | Lessons are entered by administrators, not the public | accepted |
| [0002](0002-hebrew-only-rtl.md) | Hebrew only, right to left, with no translation layer | accepted |
| [0003](0003-admin-accounts-are-real-users.md) | Admins are real accounts, created by a script | accepted |
| [0004](0004-deleting-cascades-deliberately.md) | Deleting a rabbi or place destroys their lessons | accepted |
| [0005](0005-s3-compatible-storage-one-code-path.md) | Images use one S3-compatible code path, MinIO locally | accepted |
| [0006](0006-production-on-aws-with-cdk.md) | Production runs on AWS, defined in CDK | accepted |
| [0007](0007-admin-panel-lives-in-the-same-app.md) | The admin panel is a section of the same app | accepted |
| [0008](0008-no-automated-tests-yet.md) | No automated tests yet, deliberately and temporarily | accepted |
| [0009](0009-scraped-lessons-stay-out.md) | Scraped lessons do not reach the site yet | accepted |
| [0010](0010-production-shape-traded-for-cost.md) | The production shape, and what was traded for cost | accepted |
