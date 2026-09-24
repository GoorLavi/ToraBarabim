# 0036: The site invites dedications by contact only, and is not a donation platform

- **Status:** accepted
- **Date:** 2026-09-24
- **Decided by:** project owner

## Context

[`docs/product.md`](../product.md) says the site is "not a donation platform". The home
page now invites a visitor to dedicate the site's activity: each dedication band opens a
window that leads to WhatsApp or a phone call with the site's owner. A dedication is, in
practice, a way of supporting the site, so the invitation and the line in the product
page have to be reconciled rather than left to contradict each other.

## Decision

The site is a platform for finding Torah lessons. It is not dedicated to donations, and
donation is not what it is for, even though it does allow people to support it.

It does so in one way only: an invitation to get in touch. There is no price, no amount,
no payment, and no form on the site. What is dedicated, to whom, and on what terms is
arranged in a private conversation, off the site. What the site shows afterwards is the
dedication itself, entered by an administrator.

## Consequences

- The invitation copy never names a price or uses a money word. It speaks of dedicating
  the site's activity, never of dedicating a lesson.
- The site cannot see whether an invitation ended in a dedication. It counts presses on
  WhatsApp and call; the dedications themselves are counted by hand.
- The line in `docs/product.md` is amended to link here.

## Rejected

- **Taking payment on the site.** It would turn the site into the donation platform the
  product page rules out, and bring payment handling, receipts and their obligations
  with it. Reversing that needs a new record.
- **No invitation at all.** Dedications would keep arriving only through people who
  already know the owner.
