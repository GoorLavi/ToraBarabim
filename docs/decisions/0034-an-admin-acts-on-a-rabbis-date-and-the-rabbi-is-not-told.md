# 0034: An admin cancels or moves a rabbi's date, and the rabbi is not told

- **Status:** accepted
- **Date:** 2026-09-17
- **Decided by:** project owner

## Context

A rabbi has been able to cancel or move a single date of his own lesson since
[0015](0015-rabbis-manage-their-own-listings.md). The admin panel could edit a lesson's
recurrence rule and nothing else, so an administrator handling a phone call about
tonight had to change the rule and change it back, which is a different action with
different consequences. The lesson view page now lists a lesson's upcoming dates and
acts on one of them.

That makes an administrator able to change what a rabbi's lesson says, on the rabbi's
behalf, without the rabbi doing anything. There is no notification of any kind in this
project: no email, no message, nothing that reaches a rabbi when something about his
listing changes.

## Decision

An administrator may cancel, move, or restore any date of any lesson, and the rabbi is
not notified. The change is visible to him in his own panel the next time he opens it,
in the same list he uses to make the same changes himself.

## Consequences

- **A rabbi can find his lesson cancelled without having asked**, and nothing tells him
  when or by whom. The only trace is the state of the date itself.
- The reverse is the reason to accept it: somebody calls the office at four in the
  afternoon, and the person who answers can take the lesson off the public page before
  people set out. A rule that required the rabbi's involvement would fail exactly when
  it is needed.
- **The public page shows the cancellation reason** an administrator types, or
  "לא נמסרה סיבה" when there is none. A rabbi cancelling from his own panel has no
  reason field at all, so his cancellations always publish the second version.
- Nothing records who made the change. There is no audit trail on a lesson exception.

## Rejected

- **Asking the rabbi to confirm:** the call that prompts a cancellation is usually the
  rabbi's own, and a confirmation step puts the public page behind someone who is
  driving.
- **Notifying him afterwards:** correct, and it needs a notification channel this
  project does not have. It is a change of its own, not a clause in this one.
- **Restricting an admin to the lesson's own settings:** that is what the panel did
  until now, and it is what made a single cancellation into a rule change.
