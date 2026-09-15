# 0026: Rabbaniyot teach women only, and the honorific is a field

- **Status:** accepted
- **Date:** 2026-09-15
- **Decided by:** project owner

## Context

A rabbi's name was free text, and whether it carried "הרב" depended on whoever typed it.
Most live names did not, so cards read "אייל עמרמי", which this audience reads as a lack
of respect. Some teachers are rabbaniyot, and a rabbanit does not teach men, so the
listing has to know which one it is holding.

## Decision

Every rabbi carries an honorific, `rav` or `rabbanit`. The name is stored bare and the
honorific is composed in front of it wherever the name is shown. An honorific typed into
the name field is stripped on save, so it can never appear twice.

An administrator chooses the honorific once, when creating the rabbi, and it never
changes afterwards: a rav does not become a rabbanit. The rabbi sees it on his own
profile and cannot change it either.

A lesson taught by a rabbanit is for women only. Her lesson form shows no audience
choice, and the server refuses any other audience when a lesson is saved for her.

## Consequences

- An honorific chosen wrongly is fixed by deleting the rabbi and creating her again, and
  deleting a rabbi deletes her lessons
  ([0004](0004-deleting-cascades-deliberately.md)). A mistake noticed late costs
  retyping her lessons.
- **The women-only rule is not enforced on substitutes.** There is no screen for naming
  a one-time substitute, so the server does not check whether the substitute is a
  rabbanit. What would change it: the first screen that lets anyone name a substitute
  must add the check.
- There are exactly two honorifics. "הגאון", "אדמו״ר" and the like have no place; adding
  one is a new value in the field and a copy decision, not a free-text edit.
- A name that changed shape changes its slug. Old links still resolve, because a rabbi is
  found by id and a mismatched slug redirects.

## Rejected

- **Keep the honorific inside the typed name.** That is what produced the bare names in
  the first place, and it cannot drive the women-only rule.
- **Let the honorific change, refused while she has lessons that are not for women.**
  Built and then removed: the owner's position is that a rav never becomes a rabbanit,
  so the only case it served was a typo, which does not justify the machinery.
- **Let the rabbi set his own honorific.** It decides what may be published under his
  name, so it belongs with the people who open the accounts
  ([0015](0015-rabbis-manage-their-own-listings.md)).
- **Check substitutes on the server anyway.** Nothing in the product names a substitute
  today; the owner chose not to guard a path nobody uses.
