# 0009: Scraped lessons do not reach the site yet

- **Status:** accepted
- **Date:** 2026-08-14
- **Decided by:** project owner

## Context

The `scraper` workspace collects lesson listings from other sites through per-source
adapters. It reads the city list from the database, but writes its findings to a run
report file. Nothing it collects reaches the public site.

That leaves an obvious question with no answer in the code: how does scraped material
become a listing?

## Decision

It does not, for now. The scraper stays a side tool that produces a report a human
reads. No automatic import, and no review queue in the admin panel yet.

## Consequences

- The scraper is dead weight in the repository until this is revisited. It builds and is
  maintained but changes nothing a visitor sees.
- Filling the site stays entirely manual, which compounds the cost already accepted in
  `0001`.
- Nothing in the schema currently records where a lesson came from. Whenever import does
  arrive, it will want that, and adding it later means backfilling every existing row.

## What would change this

The admin panel being live and in real use, and the manual entry rate proving too slow.
At that point the natural shape is a review queue: scraped candidates land in a holding
area, an administrator accepts or rejects each one, and only accepted ones become
lessons. That was the recommendation and it was deferred, not rejected on the merits.

## Rejected

- **Importing scraped lessons straight into the site.** Fills the directory fastest and
  puts someone else's mistakes in front of the public under our name, which contradicts
  the accuracy premise the whole product rests on.
