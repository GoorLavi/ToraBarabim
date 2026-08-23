# 0014: The logo is a fixed mark, not a theme token

- **Status:** accepted
- **Date:** 2026-08-21
- **Decided by:** goorlavi

## Context

The design system left the wordmark open: `תורה ברבים` was set type with no mark
(`.claude/design-system.md`, "Open"). The designer explored several directions in a
Figma drafts file, including a Beit HaMikdash (Temple) structure mark, and iterated on
its weight until one variant survived legibly at every size the product needs, from a
16px favicon up to a marketing banner. The human picked that variant.

Separately, the site ships three interchangeable color themes
([design-system.md, "Themes and the token contract"](../../.claude/design-system.md)),
where every token resolves to a different value per theme and no
component may assume one theme's color. The logo mark is built from two of those
tokens, `color.primary` and `color.accent`, which raised the question of whether the
logo should recolor when the theme changes.

## Decision

**The logo is `תורה ברבים` paired with an abstract Beit HaMikdash mark, always
rendered in the `ארגמן וזהב` colors:** `#6B2436` for the structural shapes, `#B8862B`
for the arched entrance (or `#FFFFFF` / `#E0B45E` on a `primary`-filled background).
This holds regardless of which of the three themes is active. The logo does not read
`color.primary` or `color.accent` from the active theme; it carries its own fixed
values.

Mark geometry, sizing, and safe-area rules are recorded in the Figma file
(`sLBptV1k2ASbu1vKP0caBz`, frame `14:3`) and are the source for whoever implements it
in code.

This closes the "wordmark" line in `.claude/design-system.md`, "Open".

## Consequences

- **The logo is the one deliberate exception to "tokens are named for their role, never
  for their color."** Every other themed surface must stay theme-agnostic; the logo is
  the one place a raw, theme-independent color pair is correct, because a brand mark
  that turns green or blue with the theme picker stops being a recognizable mark. This
  needs a one-line comment at the implementation site naming this decision, so a future
  reader does not "fix" it into reading the active theme.
- **A future fourth theme does not get to change the logo.** Any new theme still ships
  the logo in the `ארגמן וזהב` values above.
- **The mark has two intended cuts by size**, not one scaled shape: a hand-tuned 16px
  favicon cut (single beam, grid-snapped) and the general shape used from the header
  size up. Implementation needs both, not one asset scaled down.

## Rejected

- **Recoloring the logo with the active theme's `primary`/`accent`.** Rejected because
  it turns a fixed brand mark into a variable one; a Temple silhouette in olive-and-terracotta
  or slate-and-blue was judged to no longer read as the same mark. The token contract
  that binds every other themed surface deliberately does not extend to the logo.
- **A ring-of-dots mark, an open-arch mark, and a serif wordmark**, explored earlier in
  the same file. Rejected respectively for dissolving into a spinner-like shape at
  favicon size, for being a safer but less specific option, and for reading in a
  different typographic voice than the rest of the interface and colliding with a link
  underline in the header band. A detailed line-mark variant of the Temple structure was
  also rejected for not surviving 16px legibly.
