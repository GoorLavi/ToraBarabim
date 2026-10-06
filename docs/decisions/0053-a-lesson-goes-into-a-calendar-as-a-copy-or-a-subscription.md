# 0053: A lesson goes into a calendar as a copy or as a subscription

- **Status:** accepted
- **Date:** 2026-10-06
- **Decided by:** goorlavi

## Context

The lesson page gains "add to calendar". An event added to someone's calendar is a copy
we can never touch again, so a cancellation or a move does not reach it, and accuracy
is the product. The only kind of calendar entry that updates is a subscription: the
person's calendar app fetches a URL of ours on its own schedule.

## Decision

- **A one-time lesson** is added as a copy (an `.ics` file, or a prefilled Google
  Calendar event on Android). It holds the date shown on the lesson card, or the next
  scheduled date when that one has started or is cancelled.
- **A recurring lesson** offers two choices: "רק שיעור אחד", a copy of one date as
  above, or "כל השיעורים הבאים, עם עדכונים", a subscription to that one lesson's feed
  ([0054](0054-each-lesson-has-a-public-calendar-feed.md)).
- **Android gets both choices too.** The subscription goes through Google's subscribe
  link, which may open in the browser rather than the app; the owner accepted that.
- **Every event links back** to the lesson page and the site, tagged
  `utm_source=calendar`, so a return from a calendar is measurable.
- **There is no rabbi-wide feed.** Nobody follows one rabbi to every city where they teach.

## Consequences

- A copy never updates. Its description says so and points at the lesson page, which
  always does. Someone can still travel to a lesson that was cancelled after they added
  it.
- A subscription updates on the calendar app's schedule, not ours: within about an hour
  on Apple, up to a day on Google. The sheet says "לפעמים רק אחרי יום". A same-day
  cancellation may arrive late.
- Each subscribed lesson shows as its own calendar in the person's calendar list.
- On Android, subscribing needs a browser signed in to Google; some people will not
  finish it and can fall back to the copy.

## Rejected

- **Copies only.** Simplest, but a recurring lesson stays in the calendar for weeks
  after it changes.
- **A copy as an open-ended weekly rule.** A lesson that stopped would repeat in the
  calendar forever.
- **Subscription for every lesson, one-time included.** A calendar list entry per
  one-time lesson costs the person more than the rare change it would carry.
- **Android without the subscription.** Proposed, and turned down by the owner: the
  people who manage it should get the updates.
