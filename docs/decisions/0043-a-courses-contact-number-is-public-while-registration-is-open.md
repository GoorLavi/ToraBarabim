# 0043: A course's contact number is public while registration is open

- **Status:** accepted
- **Date:** 2026-09-24
- **Decided by:** project owner

## Context

Registration never goes through the site. The only way to join a course is to reach
someone, so the course page must carry a number, and both actions on it, WhatsApp and
a call, expose that number to anyone.

## Decision

Each course has one contact number, entered by whoever lists it. It is shown on the
public page and used by both actions. The form says that the number will be public, so
the lister chooses which number to give.

Once registration closes, the number leaves the public response altogether, not only
the screen.

## Consequences

- A rabbi's personal number, if that is what he entered, is public for as long as the
  course is open.
- The site counts presses on each action, the way
  [0036](0036-the-site-invites-dedications-by-contact-only.md) does, and never learns
  whether a press became a registration.
- A closed course's page offers no way to reach the teacher except through the
  teacher's own page.

## Rejected

- **A contact form that hides the number.** It would put the site between the student
  and the teacher, and make it responsible for delivering messages.
- **Reusing the rabbi's account phone.** That number was given for signing in, not for
  publication.
