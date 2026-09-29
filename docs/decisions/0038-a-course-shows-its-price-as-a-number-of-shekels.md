# 0038: A course shows its price as a number of shekels, and never the word free

- **Status:** accepted
- **Date:** 2026-09-25
- **Decided by:** project owner

## Context

Until courses, nothing on the site showed a price. A course costs money, and the
person deciding whether to call wants to know how much. The first draft allowed free
text; the owner replaced it with a number at the plan gate.

## Decision

The price is optional, a whole number of shekels between 1 and 100,000, for the whole
course. It is shown only on the course's own page, as "350 ₪ לכל הקורס". A course with
no price shows none, and the visitor asks by WhatsApp or by phone.

The site never writes "free" about a course, and zero is not a price the form accepts.
The owner: "גם אם רושמים 0 שקל אל תרשום קורס חינם, שלא יהיו טעויות".

## Consequences

- This is the first price on the site. It describes what the teacher charges, off the
  site. The site handles none of it
  ([0036](0036-the-site-invites-dedications-by-contact-only.md) holds for courses too).
- A price per session, a range, or a discount cannot be expressed. The description
  field is where a lister explains one.
- Nothing sorts or filters by price, and the card never shows it.

## Rejected

- **Free text.** It allowed "free", "from 300" and typos, and it could not be formatted
  the way an Israeli reader expects a sum.
- **A required price.** Many teachers prefer to say it in conversation.
