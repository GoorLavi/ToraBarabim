# 0012: The home page is composed by the server

- **Status:** accepted
- **Date:** 2026-08-19
- **Decided by:** project owner

## Context

The home page defaulted to a single date, `היום`, and showed that one day's lessons. A
first-time visitor therefore saw whatever happened to be on tonight rather than what the
site holds, and a weekly lesson repeated once per occurrence in any wider view. The
product needs to answer "what is here" before it answers "what is on tonight".

## Decision

`GET /v1/home` returns an ordered list of rows. Each row carries a stable id, a
ready-made Hebrew title, and its lessons. The client renders them in the order given and
decides nothing: it does not filter, sort, title, or drop a row.

The page has exactly two modes. With no filter at all it renders the rows. The moment a
date, a city, or a search query is applied it switches to the existing single filtered
list. There is no state in between.

The four rows today are the busiest area, today, lessons open to both men and women, and
recurring weekly lessons. Inside a row each lesson appears once, at its nearest upcoming
scheduled date, over a fourteen day window.

## Consequences

- **A new kind of row needs a server release.** The row titles are Hebrew product copy
  living in `server/src/service/home/consts.ts`, far from the design system that governs
  every other string a visitor reads. That distance is the price of letting the rows
  change without shipping the client, and it will drift if nobody watches it.
- **Cancelled occurrences are excluded from the rows**, while `GET /v1/lessons` still
  returns them for the client to dim. Two endpoints now answer the same question
  differently, on purpose: a rail says what is on, a schedule says what was planned.
- The rows overlap. One lesson can appear in three of them. This is intended and is what
  makes the page feel full, but it means the page is not a list and cannot be counted.
- A row with fewer than three lessons is never sent, so on a thin database the page can
  render with two rows or none. The client must not assume four.

## Rejected

- **A flat list sorted by date.** On a phone it becomes a wall with no sense of where one
  day ends.
- **Days stacked one after another.** The smallest change, and it reproduces exactly the
  repetition the rows exist to remove: a daily lesson appearing fourteen times.
- **The client deciding the rows.** It would have needed the whole dataset to choose the
  busiest area, and every rule about what belongs in a row would then live in two places.
