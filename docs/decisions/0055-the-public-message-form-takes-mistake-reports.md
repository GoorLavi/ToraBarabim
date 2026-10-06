# 0055: The public message form takes mistake reports

- **Status:** accepted
- **Date:** 2026-10-06
- **Decided by:** goorlavi
- **Refines:** [0039](0039-a-public-message-form-stores-phones-and-alerts-telegram.md)

## Context

Accuracy is the product, and the people most likely to notice a wrong listing are the
seekers who read it. The public can only send the team a message (0039), which until
now opened only from tiles inside the home rails.

## Decision

- **A third message type, `report-mistake`**, opens from "מצאתם טעות? כתבו לנו" at the
  end of the lesson page and the place page, in the same window as the help tiles.
- **A report stores what it is about:** a lesson and the date, or a place. The subject
  has no foreign key and is validated for shape only, so a report survives the lesson
  being deleted a minute later.
- **The phone stays mandatory**, as in 0039.
- **Reports go to the super admin only**, in the panel and in the Telegram alert with a
  link to the subject. The place's or rabbi's own account is not told.
- **The window promises nothing.** It says the team will check, not that it will fix.

## Consequences

- The super admin is the only reader, so reports wait on one person.
- A mandatory phone keeps out noise and also keeps out some people who saw a typo and
  would have reported it anonymously. Expect low volume.
- The form still has no rate limit or spam protection; 0039's trigger for adding one
  still applies.
- A subject's id may point at a lesson that no longer exists; the admin link then
  shows the not-found page.

## Rejected

- **Tell the place or the rabbi as well.** Faster fixes, but a change to who is told
  what, and to accounts that today only edit their own listings. Can follow later.
- **Phone optional for reports.** More reports, but breaks 0039's single rule for the
  form and leaves the team no way to ask a follow-up question.
- **A foreign key to the lesson.** A lesson is hard-deleted, so the report would vanish
  or block the delete.
