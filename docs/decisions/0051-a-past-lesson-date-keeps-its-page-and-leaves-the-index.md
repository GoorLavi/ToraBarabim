# 0051: A past lesson date keeps its page and leaves the index

- **Status:** accepted
- **Date:** 2026-10-05
- **Decided by:** project owner
- **Related:** [0023](0023-the-public-pages-are-server-rendered.md), which made the
  lesson page's meta server-rendered

## Context

A lesson's page lives at `/lesson/:lessonId/:date`, one URL per dated occurrence. Google
indexed dates that had already passed and kept sending people to them, and the page
rendered a past date exactly like an upcoming one: canonical to itself, an Event block
saying `EventScheduled`, and Waze and Google Maps buttons. A seeker could go to an empty
hall.

## Decision

A past date keeps its own page and URL, with no redirect. The page says the lesson
already took place, strikes the start time, drops the navigation buttons, and leads with
the rabbi's upcoming lessons. A date before today (Israel time) carries
`<meta name="robots" content="noindex">` and no Event structured data; its canonical
stays its own URL. A date that is today and 30 minutes past its start says the lesson
already started, keeps its navigation, and stays indexed until midnight, when it becomes
a past date. "Past" is the rule the public lists already use (the 30-minute grace in
`server/src/service/lesson/consts.ts`), computed on the server, never in the browser.

## Consequences

- Every past date of every weekly lesson drops out of search over time, so a lesson's
  ranking never accumulates on one URL. A stable undated lesson page would be the fix if
  search traffic to lessons ever matters more than it does now.
- Google only sees `noindex` when it recrawls, so old dates linger in results for a
  while, and a cached page can show the previous state for about six minutes.
- A far-future date of a weekly lesson still answers 200 and can be indexed. Accepted
  for now; it needs its own decision if it shows up in Search Console.

## Rejected

- **Redirect a past date to the lesson's next date.** Recommended by `tora-ssr` as the
  clearest signal to Google; declined because a silent jump to another date confuses the
  person who clicked, and a one-time lesson has no next date to go to.
- **A stable undated page per lesson, with dated pages canonical to it.** The textbook
  end state; declined now as a new page type and URL model for a problem the notice
  solves.
- **Keep past dates indexed with the notice.** The default both advisors leaned to;
  the owner chose to remove them from Google.
- **A "next date" button in the notice.** Drawn and declined: the rabbi's lessons lead,
  and the next date of the same lesson is the first card in that row.
