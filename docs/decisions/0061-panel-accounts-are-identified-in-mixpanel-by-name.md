# 0061: Panel accounts are identified in Mixpanel by name

- **Status:** accepted
- **Date:** 2026-10-06
- **Decided by:** goorlavi
- **Refines:** [0024](0024-visits-are-measured-by-mixpanel-full-tracking-no-consent-banner.md)

## Context

[0024](0024-visits-are-measured-by-mixpanel-full-tracking-no-consent-banner.md) tracks a
browser, not a person: its consequences note that nothing calls `identify()`, and it
named "data that identifies a person rather than a browser" as the point at which its
no-banner shape is revisited. The owner now wants to follow what a rabbi or a place does
in their panel and read who it was, which a browser id cannot give him.

## Decision

- **A rabbi or a place account that signs into its panel is identified in Mixpanel by
  its account id**, with a user profile carrying the full name (a rabbi's with the
  honorific, a place's name) and the rabbi or place id. Nothing else: no email, no phone.
- **The name is read from the live profile**, not from the account's copy of it, and is
  set again on every panel visit, so an edited name follows.
- **Logging out resets the identity.** The browser is anonymous again from then on. A
  login resets it too, before anything else, so a browser that still carries a previous
  account (a session that expired without a logout, a shared computer) never has the
  new login attributed to the old account.
- **Admins are not identified.** [0052](0052-our-own-browsing-is-not-counted.md) keeps
  their browsers out of Mixpanel altogether, and that comes first.
- **The two missing lifecycle events exist**: `Panel Login` on the shared login door and
  `Place Logout`, beside the `Rabbi Logout` that was already there.

## Consequences

- Mixpanel now holds the names of real people, the rabbis, tied to what they do. The
  names are the ones the site already shows publicly, and the panel is behind a
  password, but this is the line 0024 named. Its no-banner, no-privacy-page gap is now
  also a gap for the panel users, and it is still accepted on purpose.
- While a rabbi stays signed in (the session cookie outlives the visit) their browsing of
  the public site from the same browser is attributed to them, not to an anonymous
  seeker. Only a logout or the next login ends that: a session that merely expires
  leaves the identity on the browser until one of them. 0052's "rabbis are counted"
  still holds, under their name rather than a browser id.
- Browsing done before a login is not joined to the account: the reset on login starts
  a fresh anonymous id, and only what follows is merged into the account.
- Mixpanel's `reset()` also drops the registered super properties, so the logout path
  re-registers them. A later wrapper change that forgets this ships events with no
  `appSurface` after a logout.
- Deleting an account does not delete its Mixpanel profile. That is a manual step in
  Mixpanel, for the owner, if it is ever needed.

## Rejected

- **Identify by the rabbi or place id instead of the account id.** One account per rabbi
  or place today, so either works, but the account is the thing that logs in and the
  profile carries the other id anyway.
- **Keep the identity scoped to the panel** (reset when leaving for the public site).
  Mixpanel's identity is per browser, not per route; faking a boundary with resets on
  navigation would split one person into many profiles and still leak at every tab.
- **Send the email too.** Useful for finding an account, but it is private where the
  name is public, and the owner chose name and ids only.
