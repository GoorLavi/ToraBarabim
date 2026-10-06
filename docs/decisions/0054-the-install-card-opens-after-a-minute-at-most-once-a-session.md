# 0054: The install card opens after a minute, at most once a session, until dismissed twice

- **Status:** proposed
- **Date:** 2026-10-06
- **Decided by:** goorlavi

## Context

The goal is that seekers stop forgetting the site exists. An icon on the home screen
does that, but most people will never add one unless asked. Google's guidance counts
an overlay that hides the page against it, and a card that keeps returning reads as
nagging.

## Decision

- **A compact card at the bottom of the screen** (a corner card on desktop), taking a
  small fraction of the screen, with no dim and no focus trap. It is offered on public
  pages, the course page included, from the first visit.
- **It opens after 60 seconds of visible time on public pages in a session**, and waits
  while the person is busy: a dialog, sheet or picker open, or a text field focused.
- **At most one automatic show per session. A show counts only when it is dismissed**;
  an ignored card disappears on navigation and may return in a later session. Two
  dismissals end automatic shows for good, and so does installing.
- **If its memory cannot be read or written, it never shows** (fail closed): a card that
  cannot remember being dismissed is the worst version.
- **Never** in an installed or standalone window, in the admin, rabbi or place panels,
  on `/login`, or inside in-app browsers (WhatsApp, Instagram, Facebook).
- **A permanent footer link, "הוספה למסך הבית"**, goes straight to the right
  destination: the browser's own dialog on Chrome and Edge, numbered instructions on
  iOS, an explanation in in-app browsers. Desktop browsers that cannot install get
  neither card nor link.

## Consequences

- iOS installs cannot be confirmed: Apple gives no event. The success signal is launches
  from the icon, through the `launchMode` super property, a floor like every Mixpanel
  number ([0024](0024-visits-are-measured-by-mixpanel-full-tracking-no-consent-banner.md),
  [0025](0025-mixpanel-ad-blocker-undercount-stays-no-proxy-yet.md)).
- The memory is per browser. Cleared site data or a new device starts over.
- A person who never dismisses the card sees it once in every session until they do.
- The iOS and Chrome menu labels in the instructions are quoted from memory until checked
  on a real device.

## Rejected

- **A full-screen popup on entry:** hides the page, the thing Google's guidance names.
- **An inline card on the home page only** (the designer's first proposal): quieter, but
  the owner wanted the offer to reach visitors who never see the home page.
- **Counting a show when it appears:** the owner chose to count only dismissals.
- **Waiting on the course page until the next page:** the owner chose to offer it there
  too, with the card resting above the contact bar.
