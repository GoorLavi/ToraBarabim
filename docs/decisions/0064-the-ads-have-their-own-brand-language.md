# 0064: The ads have their own brand language

- **Status:** accepted
- **Date:** 2026-10-07
- **Decided by:** goorlavi
- **Refines:** [0062](0062-the-site-advertises-to-seekers-first-through-rabbis-own-clips.md), [0027](0027-full-color-brand-marks-on-navigation-links.md)

## Context

The first closing card for a campaign clip applied the site's design system literally:
a plum field, one line of type, the header lockup, the address. The owner rejected it
on a real clip as "not impressive, not standard, barely designed", and brought a
reference end card instead. Rebuilt in the site's tokens and type, with the rabbi's
poster from the site, it uses several things the site itself never does.

## Decision

The ads carry a brand language of their own, built from the site's tokens but allowed
what a screen is not:

- **The rabbi's poster fills the top of the frame and fades into the plum field**,
  outside its 3:4 frame.
- **One gold line in the headline** (`accentOnDark`), the promise, set large; the gold
  keeps that one job on a card.
- **A white button on plum**, the site's button inverted, with a main line and a sub
  line and the site's arrow.
- **The print poster's gold rule with one diamond**, and the address in a quiet pill
  (`surfaceOnPrimary` fill, `borderOnPrimary` edge).
- **Motion**: a staged reveal of about three and a half seconds, fades with a short
  rise, no overshoot, then the card holds. A clip's closing card runs six seconds.
- **The scale rule**: a 1080-wide 9:16 frame is the site at 3x on a 360px phone, so
  every size and gap is a token times three. A 4:5 card is its 9:16 card at 80%, one
  fixed ratio, because the side-by-side layout needs the smaller type. No new colors and
  no new type.
- The text on a card is a single question broken over lines, in the singular, and the
  card line carries no colon after the rabbi's name.

The site does not inherit any of this: nothing here goes into a page.

## Consequences

- `.claude/design-system.md` gains an ad-language section listing these exceptions
  and the safe areas per platform, maintained by `tora-designer`.
- On Reels, TikTok and Stories the platform covers the bottom third, which is where
  the rule, the lockup and the address sit; accepted for the first campaign, since
  WhatsApp leads it and the paid placements carry Meta's own button. A shorter-photo
  variant for those placements is a later decision.
- The women's card is on hold; its layout exists but the owner has not approved it.

## Rejected

- **The site's restraint applied as is.** Correct for a screen, empty for a three
  second card in a feed.
- **A tint over the frozen last frame of the clip**, and **a pure typographic card**:
  the designer judged the first off-brand (a tint over a live portrait) and the second
  close in tone to a memorial notice.
