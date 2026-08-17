# 0002: Hebrew only, right to left, with no translation layer

- **Status:** accepted
- **Date:** 2026-08-14
- **Decided by:** project owner

## Context

The audience is Hebrew speaking and in Israel. The reflex in most codebases is to add a
translation layer early, on the theory that it is cheaper now than later.

## Decision

The site is Hebrew only and renders right to left. No language switching, no translation
key files, no English fallback strings. Copy is written natively in Hebrew. Code,
comments, file names, commit messages, and documentation stay English.

## Consequences

- Copy lives inline where it is used. There is no key indirection, so a string reads as
  the thing the user sees.
- Direction is expressed once through CSS logical properties rather than re-decided per
  rule. A physical `left` or `right` in layout is a defect, not a style preference.
- Adding a second language later means a real migration, not a configuration change. We
  are accepting that on the basis that it will never happen.
- Anyone reviewing UI has to be able to read Hebrew, or has to render the screen and ask
  someone who can.

## Rejected

- **An i18n library from day one.** Costs indirection on every string forever, in
  exchange for an option we have decided never to exercise.
- **English source strings translated into Hebrew.** Produces copy that reads like a
  translation, which this audience notices immediately.
