# 0027: Waze and Google Maps navigation links use full-color brand marks

- **Status:** accepted
- **Date:** 2026-09-15
- **Decided by:** goorlavi

## Context

The lesson detail page now offers two links to open the lesson's address in Waze or
Google Maps. Both are external apps a visitor already recognizes by their icon, so the
design direction was to show one brand mark per button rather than one shared generic
"navigate" glyph, since the icon is what lets someone pick their preferred app at a
glance.

The house design system calls for calm, restrained color and for raw values to come
from theme tokens, never hardcoded: `.claude/design-system.md`,
[0017](0017-one-colour-scheme-argaman-vezahav.md). A monochrome, single-color rendering
of each mark (drawn in `currentColor`, matching the ticket's on-primary text color) was
the option that stays inside that rule. The product owner chose the other option: the
real, official multi-color Waze and Google Maps marks, because brand recognition is
the entire reason two buttons exist instead of one, and a flattened mark reads as
neither app in particular.

## Decision

**The Waze and Google Maps buttons on the lesson ticket use the apps' own official,
full-color marks**, not a monochrome `currentColor` rendering. This is a deliberate,
narrow exception to the design system's color restraint: it applies only to these two
brand marks, nowhere else in the product.

**Their hover/pressed tint is also hardcoded per button**, not a new design-system
token. The color a Waze button brightens to on press is specific to that one brand mark
and has no other caller; adding a general "on-primary hover" token to the theme for a
single, brand-scoped use would be a token invented for a coverage target rather than a
real second caller, which the root rulebook already rules out. Both exceptions are
marked with a comment at their site in the component's `styles.ts` and `consts.ts`.

## Consequences

- **Two third-party trademarked assets are now committed to the repo**, sourced from
  each brand's own published asset page and credited there in a comment. If either
  brand's visual identity guidelines change, or either company asks that the mark not
  be reproduced this way, the icon (not the link itself) needs to be revisited.
- **The lesson ticket carries two colors it does not otherwise use** (the ticket is
  built entirely from `color.primary`, gold, and on-primary neutrals). This is scoped
  to a single small icon per button, not a background or a dominant surface, so it does
  not reopen [0017](0017-one-colour-scheme-argaman-vezahav.md)'s "one color scheme"
  decision; it is a deliberate, contained exception to it.
- **A future generic on-primary hover token, if one ever gets a second real caller,
  should not reuse these hardcoded values**; they belong to these two specific brands,
  not to a reusable design-system role.

## Rejected

- **Monochrome `currentColor` marks**, matching the ticket's existing restrained
  palette. This was the design-system-compliant option and is the one a builder would
  reach for by default. Rejected by the product owner because it throws away the exact
  signal (which app is which) the two-button layout exists to provide.
- **A new `color.surfaceOnPrimaryStrong` design-system token** for the hover/pressed
  state, proposed as the generic-token option. Rejected because the color it would hold
  is brand-specific, not a reusable UI role; the product owner's call was to hardcode it
  at the two call sites instead.
