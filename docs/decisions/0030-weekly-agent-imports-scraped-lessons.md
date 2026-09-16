# 0030: A weekly agent collects and imports scraped lessons, and fixed code decides every write

- **Status:** accepted
- **Date:** 2026-09-15
- **Decided by:** project owner
- **Supersedes:** [0009](0009-scraped-lessons-stay-out.md)

## Context

[0009](0009-scraped-lessons-stay-out.md) kept scraped lessons off the site, fearing
another site's mistakes published under our name. The owner now collects a weekly
timetable from seven sites he trusts: rabbis' own sites and one highly reliable
synagogue. Entering well over a hundred rows a week by hand, or reviewing each one, is
the work he wants gone. An admin-panel import with a preview screen was planned and
designed, and set aside for this lighter shape.

## Decision

A weekly scheduled Claude Code task on the owner's Mac collects the timetable into a
structured rows file and hands it to the server, which decides every add, update and
delete with fixed rules in one transaction. The agent only asks the owner what the
server cannot decide, records what he confirms, and writes a weekly summary.

- **The comparison is fixed code on the server**, not the agent's judgment and not a
  script on the Mac: the same file against the same lessons always gives the same
  result, and a week's changes go in all at once or not at all.
- **Never two lessons of one rabbi on the same day at the same place.**
- **Lessons entered or edited by hand are never touched.** Every lesson records where it
  came from (manual, imported, imported then edited by hand); a hand edit freezes an
  imported lesson, and a lesson deleted by hand is remembered and not brought back.
- **A lesson missing from its site's rows is deleted with its exceptions**, except when
  that site sent no rows or failed its sanity check, or a row that could be it was
  listed but not imported. A sharp drop from a site, or more than ten deletions in a
  run, withholds those deletions until the owner acknowledges them; the rest of the
  week applies.
- **Gaps get fixed defaults:** no audience means men only; no end time means sixty
  minutes. A row with an unrecognised city or no street is skipped with its reason.

## Consequences

- Coverage stops depending on anyone's typing speed. This is the point.
- **Nobody reads an imported lesson before the public does.** A misreading by the
  collector, most likely on the sites that publish their timetable as an image, reaches
  the site as fact.
- **A deletion the owner acknowledges without looking removes a real lesson**, with its
  cancellations. A lesson that moves to a new time is deleted and created again.
- **The defaults state things nobody checked**, until someone corrects the lesson.
- **The import depends on the owner's Mac being awake**, because the sites block cloud
  access. A missed week changes nothing; it does not delete.
- The runs table is the only trace of what the agent changed.

## Rejected

- **A review queue for every row** (0009's recommendation), and **an admin-panel import
  with a preview screen** (planned and designed): safer, and weekly work the owner does
  not want for sources he trusts.
- **The agent deciding writes lesson by lesson through the admin API:** its choices
  could differ week to week, which is how duplicates happen, and a run cut off halfway
  leaves half a week on the site.
- **Hiding a missing lesson instead of deleting it:** the owner wants the site to match
  the sources.
