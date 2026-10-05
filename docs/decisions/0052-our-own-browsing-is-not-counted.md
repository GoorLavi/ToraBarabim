# 0052: Our own browsing is not counted

- **Status:** accepted
- **Date:** 2026-10-05
- **Decided by:** goorlavi
- **Refines:** [0024](0024-visits-are-measured-by-mixpanel-full-tracking-no-consent-banner.md)

## Context

Much of what Mixpanel showed was the owner and his agents, not seekers. Two holes let it
in: the Claude desktop app's browser pane, which agents drive, looks like ordinary
Chrome (`webdriver` is false; only a `Claude/<version>` token in the user agent gives it
away), and nothing told an admin's own browser apart from a visitor's.

## Decision

- **The Claude browser pane is treated as automation**, through the same user-agent
  check that already drops headless browsers and bots.
- **A browser that has held a confirmed admin session is marked internal for good**, in
  its local storage, and from then on never loads Mixpanel. The mark outlives sign-out.
- **Internal traffic is dropped, not tagged.** Reports stay clean without a filter, at
  the price of knowing nothing about how we use the site ourselves.

## Consequences

- Every admin is excluded, the volunteers ([0038](0038-vetted-volunteers-get-admin-accounts.md))
  included, on every browser they have signed in from. Rabbis signing into their own
  panel are still counted.
- The mark lives per browser and per origin. A device where the owner never signs in
  as an admin, a private window, or cleared site data counts again. So does an agent
  driving the owner's real Chrome (Claude in Chrome) on a browser he never signed into
  the admin panel from.
- Fails open: if local storage cannot be read, the browser is counted.
- The first admin page a browser opens, the login page included, is still counted
  once: the page view fires before the session check marks the browser.
- A real visitor whose in-app browser carries a `Claude/` token would be dropped too.
- Past events are not touched; local ones can be filtered out by their URL.

## Rejected

- **Count only the production hostname.** Would also have cut every local session, but
  was not chosen; the two checks above already cover the local sessions agents run.
- **A `?notrack=1` link** to mark a browser by hand. Not needed while signing in as an
  admin does it.
- **Tag internal traffic and filter it in reports.** Keeps the data, but every report
  then needs the filter, and one that forgets it is wrong.
