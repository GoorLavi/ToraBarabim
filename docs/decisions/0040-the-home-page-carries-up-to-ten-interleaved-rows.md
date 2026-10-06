# 0040: The home page carries up to ten interleaved rows

- **Status:** accepted
- **Date:** 2026-10-05
- **Decided by:** project owner
- **Related:** supersedes the "four rows" paragraph of
  [0012](0012-the-home-page-is-composed-by-the-server.md), which otherwise stands;
  [0013](0013-rabbis-carry-a-manually-set-prominence.md), whose prominence order the rows
  keep; [0026](0026-rabbaniyot-teach-women-only-and-the-honorific-is-a-field.md);
  [0036](0036-the-site-invites-dedications-by-contact-only.md), whose bands move;
  [0041](0041-the-home-city-grid-and-the-cities-page-count-differently.md)

## Context

With about 275 imported lessons a week, the home page still showed at most four rows:
the single busiest area, today, both audiences and weekly, each lesson shown once across
all of them. Seven of eight areas never appeared, and the page read as empty. The owner
asked for more rows spread across areas, topics and times of day, and sided with product
(a row per area, so every region is visible) over the designer's proposal of fewer,
varied sections.

## Decision

`GET /v1/home` still composes the rows (0012). What it composes:

- **Rows:** today, both audiences, weekly, morning (start before 12:00), midday (12:00 to
  16:00), up to five area rows ranked by lesson count, and a row per topic that clears
  the minimum. Never a row for the topic `other`.
- **Interleaved:** one row from each family in turn (fixed, area, topic), today first.
  Two area rows or two topic rows are never adjacent: when the next row would be, the
  composition stops. At most ten lesson rows.
- **Repeats allowed across rows**, as 0012 first intended; once within a row.
- **At most two lessons per teaching rabbi in a row** (the substitute when there is
  one), after prominence order, so less-known rabbis fill the rest of the row.
- **One women's-area tile**, in the first row from the sixth with room for it, falling
  back to the second.
- **Dedication bands:** women's band after rail 2, success after rail 6, healing after
  rail 8. With fewer rails each falls to after the last, success before healing. In
  filtered mode the healing band stays after the results.
- **City grid:** the twelve cities with the most lessons, each with a count.

The thresholds live in `server/src/service/home/consts.ts` and
`client/src/HomePage/components/HomeRails/consts.ts`.

## Consequences

- **Topic rows are thin.** The import maps a topic only on an exact word, so most
  imported lessons carry none. The owner declined fixing the mapping in this change, so
  few topic rows appear until it is fixed.
- **The page is long on a phone**, about eight screens before the rabbi row and the city
  grid. The owner chose to keep the rabbi row at the bottom.
- **The old fail-closed rule is gone.** The success band used to hide on a page with
  fewer than three lesson rows. The owner's clamp rule replaces it, so on a thin page the
  two dedication bands sit back to back at the end.
- **Band placement has no CI test.** It is asserted only by Storybook plays, which do
  not run in CI. The owner declined adding one (2026-10-05).
- **Analytics row ids changed** from `area` to `area:<area>` and `topic:<topic>`. Saved
  Mixpanel reports that filter on `area` need updating.
- **Reverses "a topic browse axis on the home page"** from the design system's
  decided-against list.

## Rejected

- **One area rail switched by chips**, the designer's proposal: fits many areas in one
  slot, but hides them behind a tap, which is the opposite of what the owner asked for.
- **A "tonight" strip and a featured rabbi**: different shapes to break the rhythm;
  the owner kept the existing today row and declined the featured slot.
- **Keeping lessons unique across rows**: clean, but it starves the later rows once
  there are ten.
- **No row cap**: up to seventeen rows in the worst case.
