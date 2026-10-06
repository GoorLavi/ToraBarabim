# 0050: The import knows a lesson by rabbi, day and start time, and attaches it to a place

- **Status:** proposed
- **Date:** 2026-10-05
- **Decided by:** project owner
- **Supersedes in part:** [0030](0030-weekly-agent-imports-scraped-lessons.md), its rule
  "Never two lessons of one rabbi on the same day at the same place"

## Context

The weekly import decided that a row was an existing lesson only when the rabbi, the day
and the exact place name matched. Sites spell the same synagogue differently from the
owner ("בהכנ"ס "ספרא"" against "פסגת זאב בית הכנסת ספרא"), so the same lesson went in
twice, in the runs of 2026-09-22 and 2026-10-04. A hand-kept table of spellings in the
collection skill patched each case after it happened. The same rule also kept only one
of two real lessons a rabbi gives at one place on one day at different times, and every
imported lesson was written as free address text, so the places the owner created showed
no lessons.

## Decision

- **A lesson is a rabbi, a day and an exact start time.** The place no longer decides
  identity. Two lessons of one rabbi at one place on one day at different times are two
  lessons; there is no tolerance (21:00 and 21:05 are different) and no chaining of
  matches.
- **Weekly beats once.** A one-off row at the weekday and time of a weekly lesson is that
  lesson, and a weekly lesson is never proposed for deletion because of a one-off.
- **Common synagogue spellings are one name** ("בהכנ"ס", "ביכנ"ס", "בינכ"ס", "ביה"כ",
  "ביהכנ"ס", "בית כנסת" are "בית הכנסת"), for matching and for naming new places.
- **A lesson attaches to an existing place** when its normalised name and city match one
  active place exactly; the street is not compared.
- **The import creates a place for a synagogue** with a street and a known city when none
  matches. It never creates one for a private home, never deletes or deactivates a place,
  and a created place is public at once with a cleaned name.
- **An imported twin of a hand-entered lesson is deleted only on the owner's approval of
  that lesson**, shown beside the lesson it duplicates. A source-wide acknowledgement never
  releases it, and twins are left out of the ten-deletion limit and the sharp-drop check.
- **A lesson deleted by hand is now remembered by its time** as well as its place, for
  deletions made from this change on.

## Consequences

- When a site moves a lesson's time, an imported lesson is deleted and added again
  through the guarded deletion path. A hand-entered lesson at the old time stays, and the
  new one appears beside it, marked in the weekly summary as a possible duplicate.
- Stored import keys change form (`rabbi|w<day>|t<time>`); old keys stay readable, so no
  migration and no mass rewrite. A lesson keeps its old key until something about it
  changes.
- The hand-kept spelling table in the collection skill, and the manual pre-apply
  duplicate check in the import skill, are removed once this is live.
- Accepted gap: a lesson deleted by hand before this change is remembered by its place
  only.
- The first run after this ships is a plan only, shown to the owner before anything is
  written.
