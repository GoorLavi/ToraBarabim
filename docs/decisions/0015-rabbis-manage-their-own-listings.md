# 0015: Rabbis manage their own listings

- **Status:** accepted
- **Date:** 2026-08-23
- **Decided by:** project owner
- **Supersedes:** [0001](0001-lessons-are-admin-entered.md), and the "no roles" part of
  [0003](0003-admin-accounts-are-real-users.md)

## Context

[0001](0001-lessons-are-admin-entered.md) held that only administrators enter listings,
and explicitly rejected "submission by verified rabbis only" as buying a moderation
product before the listing product existed. That was right while the listings were being
seeded by hand. It stops being right the moment coverage is limited by how fast a small
group can type, and the people who actually know when a lesson moved are not in that
group.

The rabbi is not the public. He is a known person, his account is opened for him by an
administrator, and he is editing the one record that is already about him.

## Decision

A rabbi gets an account and edits his own profile and his own lessons directly. His
changes go live immediately: there is no approval queue.

- An administrator creates the account and hands over a temporary password by phone.
  There is no signup page and no email of any kind, so no reset flow either.
- One account belongs to exactly one rabbi, and one rabbi has at most one account. Both
  halves are enforced by database constraints, not by application code.
- He may edit his name, title, biography and poster; create, edit and permanently delete
  his own lessons; and cancel or move a single date.
- He may not touch another rabbi, reassign a lesson, manage accounts, or reach any admin
  route. Every rabbi route is guarded server-side and scoped from the session, never from
  an id the client sends. Another rabbi's resource answers `404`, not `403`, so probing
  an id cannot distinguish "not yours" from "does not exist".
- `prominence` ([0013](0013-rabbis-carry-a-manually-set-prominence.md)) is never sent to
  him and never accepted from him. It is our sort input, not his to raise.

Accounts therefore now carry a role, which [0003](0003-admin-accounts-are-real-users.md)
deliberately deferred. That deferral is over: there is now a second kind of account, which
is exactly the condition 0003 named for revisiting it.

## Consequences

- Coverage stops being bounded by the administrators' typing speed, which was the whole
  point.
- **The accuracy promise now rests on people outside the team.** A wrong lesson reaches
  the public with nobody having read it. The listings are still curated in the sense that
  nobody self-registers, but they are no longer reviewed.
- **A rabbi can permanently delete a lesson an administrator entered, and nothing records
  that it happened.** There is no audit log and no soft delete. The seven day database
  backup is the only recourse and it answers the question badly. This was raised with the
  owner, with soft delete and a single log line both offered, and declined as a corner not
  worth entering yet. What would change it: the first time someone asks "who deleted
  this?" and we cannot answer.
- A forgotten password costs an administrator a phone call. Fine at a handful of rabbis,
  annoying well before a hundred.
- There is no route back into the site for a locked-out rabbi other than reaching a human,
  and the panel says so plainly rather than linking to a page that cannot help him.
- The admin panel's JavaScript already shipped to every visitor
  ([0007](0007-admin-panel-lives-in-the-same-app.md)); the rabbi panel now does too. The
  bundle crossed 500KB with this change. Splitting the panels into their own chunk is the
  fix that 0007 already named, and it is not done.

## Rejected

- **An approval queue.** Safest for accuracy, and it makes the rabbi's every correction
  wait on someone else. The owner chose speed knowingly. Reversing this is a new record,
  and the queue is where to start.
- **Self-signup with verification.** Same identity problem 0001 named, unsolved.
- **One account managing several rabbis**, for a gabbai or a secretary. Real, but
  speculative, and it complicates every permission check.
- **Soft delete, and an audit log.** See the consequence above: declined, not overlooked.
