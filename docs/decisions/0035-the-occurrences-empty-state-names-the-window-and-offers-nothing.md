# 0035: The occurrences empty state names the window and offers nothing

- **Status:** accepted, and it is a known exception to the empty-state rule
- **Date:** 2026-09-17
- **Decided by:** project owner

## Context

The admin lesson page lists a lesson's upcoming dates over a fixed window of fourteen
days. When a lesson has no date inside it, the section says
"אין מועדים בשבועיים הקרובים" and stops there.

Two things say that is not finished. The design system requires an empty state to name
its constraint and then widen along the one axis available, and the approved Figma frame
draws a control under this exact line: "הצגת מועדים נוספים". The axis here is the date
window.

The endpoint cannot do it. `GET /v1/admin/lessons/:lessonId/occurrences` takes no window
parameter and reads `UPCOMING_OCCURRENCE_WINDOW_DAYS` on the server, so there is no
request the client can make that would return more. The control would be a button that
does nothing.

The same server constant is what
[0033](0033-a-one-time-lesson-outside-the-two-week-window-cannot-be-cancelled-yet.md)
is about, and a window parameter would close both at once.

## Decision

The empty state ships as a sentence with no action, and the missing control is recorded
here rather than drawn. Widening the window is a server change, and it is not made
inside a round that is about the admin's cancel and move surface.

## Consequences

- **This screen is a documented exception to the empty-state rule**, and it is the
  first one. Anyone reading the rule and then this screen should find this record rather
  than conclude the rule is optional.
- The approved Figma frame draws a control that the code does not have, so the frame and
  the build disagree on this one point until the window parameter exists.
- An administrator whose lesson has no date in the next two weeks has nothing to do on
  this screen, which is the same dead end
  [0033](0033-a-one-time-lesson-outside-the-two-week-window-cannot-be-cancelled-yet.md)
  describes from the other direction.

## Rejected

- **Drawing the control anyway:** a button that returns the same empty list is worse
  than no button, because it spends the person's one attempt and tells them nothing.
- **Adding the window parameter in this round:** the right fix, and it belongs with
  [0033](0033-a-one-time-lesson-outside-the-two-week-window-cannot-be-cancelled-yet.md)'s
  change, which touches the rabbi's endpoint too, rather than inside this one.
- **Removing the sentence and rendering nothing:** the constraint is the useful half. A
  person who knows the list covers two weeks stops looking for a date that is further
  out.
