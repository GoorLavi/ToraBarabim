# 0015: The site ships one colour scheme, ארגמן וזהב

- **Status:** accepted
- **Date:** 2026-09-07
- **Decided by:** goorlavi

## Context

Three colour schemes shipped together on purpose, with a plain dev switcher in the
corner of the public site, so they could be compared in the running app rather than
argued about in a document. `ארגמן וזהב` was the default from the start. The comparison
has now run long enough on real screens, and the human picked it.

The switcher was always a temporary affordance, not a product feature: it was visible to
anyone who opened the site, and the site has no reason to offer a visitor a choice of
palette.

## Decision

**`ארגמן וזהב` is the site's colour scheme. It is the only one.** The other two schemes,
`אבן וזית` and `אבן ותכלת`, are deleted, along with the switcher, the stored preference,
and the machinery that selected between schemes at runtime.

One theme object is handed to `ThemeProvider`. There is no theme name, no theme list, and
no way for a visitor or a developer to change the palette without editing the token
values.

## Consequences

- **Reintroducing a second scheme is now a real piece of work, not a flip.** The record
  type, the selection hook, and the persisted preference are gone from the code. Git
  remembers them, so the two deleted palettes are recoverable, but nothing in the working
  tree hints they ever existed. This is the intended cost: a switcher nobody uses is
  worse than no switcher.
- **A dark mode, if it ever arrives, is a fresh decision** and will not inherit this
  removed machinery. It is a different problem from "which of three palettes", and
  starting from an empty slate is more honest than reviving a hook built for the other
  question.
- **The token contract loses one of its two reasons.** "Identical token names across
  every theme" existed so three schemes could coexist safely; with one scheme it says
  nothing. "Tokens are named for their role, never for their colour" survives on its own
  merits and still binds: `color.primary`, never `color.plum`.
- **Visitors who saw the site before keep a dead `torabarabim:theme` key in their
  browser's localStorage.** Nothing reads it. No cleanup code was written for it, because
  the cost of carrying that code forever is higher than the cost of an orphaned key.
- **[0014](0014-the-logo-is-a-fixed-mark-not-a-theme-token.md) still stands and is not
  superseded.** The logo carrying its own fixed colours is now trivially satisfied rather
  than load-bearing, but the rule and the comment at the implementation site stay: they
  are what stops a future theme, if one ever arrives, from recolouring the mark.

## Rejected

- **Keeping the switcher behind a development-only flag.** Rejected because a flag is a
  second code path that nobody exercises and that rots silently. Once the scheme is
  chosen, the alternatives are history, and history belongs in git.
- **Keeping the three palettes in code but hiding the switcher.** Rejected for the same
  reason the house rule says replacing means deleting: dead palettes still type-check,
  still get maintained by whoever adds a token next, and give the next reader no way to
  tell they are dead.
- **Deferring the choice further.** Rejected because the switcher was on the public site.
  Every day it stayed was a day a visitor could change the brand's colours from the
  corner of the page.
