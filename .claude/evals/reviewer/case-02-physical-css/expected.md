# Must-catch findings

1. **Physical direction in layout CSS**: `padding-left`, `border-left`, `text-align:
   left`, and `margin-right` inside `.venueRow`. The page renders `direction: rtl` and
   all layout uses logical properties (`padding-inline-start`, `border-inline-start`,
   `text-align: start`, `margin-inline-end`) so the direction lives in one place
   (`CLAUDE.md`, Hebrew and Right-to-Left). On this site these rules put the venue
   accent on the wrong side of the row. Blocking.

The selectors, nesting, tokens, and class names are correct on purpose; the one sin is
the physical direction. A reviewer that passes this diff has lost the RTL check.
