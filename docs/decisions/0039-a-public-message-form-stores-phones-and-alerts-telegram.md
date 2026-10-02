# 0039: A public message form stores visitors' phones and alerts Telegram, fail-open

- **Status:** accepted
- **Date:** 2026-10-01
- **Decided by:** project owner
- **Related:** [0001](0001-lessons-are-admin-entered.md), whose "no public submission
  form" this narrows; [0036](0036-the-site-invites-dedications-by-contact-only.md),
  whose "no form" applied to dedications only; [0012](0012-the-home-page-is-composed-by-the-server.md)
  and [0023](0023-the-public-pages-are-server-rendered.md), which the random tile
  placement has to respect; [0020](0020-one-super-admin-gates-admin-management.md)

## Context

Until now the only way to tell the team about a missing rabbi was the contact page's
email address, which lands outside any panel and is read by hand. The owner wants
visitors to help add rabbis without creating ongoing manual work, and wants every
message in one place, with a nudge when one arrives.

## Decision

The site gets its first public form. From tiles that sit inside the home page's lesson
rails, a visitor sends a name, a phone number and a free message, typed as a request to
add a rav or rabbanit, or as an offer to volunteer. The server stores it, then sends the
full message, phone included, to the owner's existing Telegram channel, the same chat
and bot the server's alarm notifier already uses. The messages panel in the admin
section, visible to the super admin only, is the record: each message is marked
handled or not, and carries a free-text note on how it was handled.

- **Fail-open on the alert.** The message is saved first. If Telegram is down or
  unconfigured, the visitor still sees "thank you", and the failure is logged with the
  message id. Telegram is a convenience; the save is what matters.
- **No spam protection** in the first version: no rate limit, no hidden field, no
  puzzle.
- **No privacy notice and no retention rule** in the first version: the phones stay
  until the owner deletes the row by hand.
- **No promise is made to anyone**, not to the sender and not to the rabbi named.
- **The tiles are placed at random by the server on every request**, at most one per
  row, never in the first two slots, never beside the women's-area tile, each kind at
  most once per page. This is the home page's first deliberate per-request randomness
  (0012 had kept its composition reproducible). The placement rides in the server's
  payload, so hydration matches, and a tile may move when the page refetches.

## Consequences

- The site now holds personal data typed by the public, and forwards it to everyone
  in the Telegram channel. The owner decides who is in that channel.
- A bot can fill the table and the channel. **Reopening trigger:** spam arrives. The
  prepared answer is a per-visitor rate limit and a hidden field; the key to limit on
  behind CloudFront and API Gateway is the open question that change must settle, since
  the request's own address there is the proxy's.
- Messages pile up unread if the super admin is unreachable, the same single point of
  failure 0020 accepted.
- Telegram's credential now lives in the server task as well as in the alarm Lambda,
  read from the same SSM parameter. ECS resolves that secret before the container
  starts, so the server task no longer starts if the parameter is missing, even though
  the server code treats the variable as optional. The parameter already exists for the
  alarm notifier; deleting or renaming it now takes the site down at the next deploy.
- The tiles can move under a visitor's eyes after a refetch; the open window and its
  draft survive that, the tile underneath does not.
- The three message routes log a failed database write as error names plus the
  Postgres code and constraint only, never the message or the parameters, because
  those carry the visitor's name, phone and text. An unexpected 500 there is harder
  to diagnose from the logs than elsewhere; that is accepted so the payload never
  reaches CloudWatch.

## Rejected

- **Volunteers or gabbaim entering listings through the form.** The form sends a
  message; people with accounts enter listings. Keeping the two apart is what keeps the
  product line in `docs/product.md` true.
- **A second inbox.** Replacing or merging the contact page was recommended and
  declined: the owner keeps `כתבו לנו` beside the new tiles.
- **A fixed block of tiles on the home page.** Recommended by product and design,
  declined by the owner in favour of tiles inside the rails, the size of a lesson card.
- **Spam protection, a privacy line, a retention rule, a success metric.** Each
  deferred on purpose, with its trigger above where it has one.
