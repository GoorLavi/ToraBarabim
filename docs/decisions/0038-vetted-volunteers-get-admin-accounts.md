# 0038: Vetted volunteers get plain admin accounts, with no change log yet

- **Status:** accepted
- **Date:** 2026-10-01
- **Decided by:** project owner
- **Related:** [0015](0015-rabbis-manage-their-own-listings.md), whose known-person
  model this extends; [0020](0020-one-super-admin-gates-admin-management.md), which
  decides who can open these accounts; [0003](0003-admin-accounts-are-real-users.md)

## Context

Coverage is limited by how fast the owner's own group can add rabbis. The home page
now invites visitors to volunteer, and the owner speaks to every applicant himself
before anyone gets access. `docs/product.md` says the listings are curated, not
crowdsourced, and that only a small trusted group enters them; a volunteer who adds
rabbis had to be reconciled with that line rather than left to contradict it.

## Decision

A volunteer the owner has vetted by phone gets an ordinary admin account, created by
the owner (the super admin, per 0020). There is no separate "editor" role: a volunteer
can do everything an ordinary admin can, including creating rabbi and place accounts
and resetting their passwords.

This does not change the product line. The public still never adds a listing: it can
only send a message. The people who change what is listed remain known people with
accounts someone opened for them, which is the model 0015 set for rabbis.

Nothing records who added or changed a lesson. That gap is accepted for now.

## Consequences

- Each volunteer is trusted beyond adding lessons: with any rabbi account's password
  within reach, the circle is only as safe as the owner's vetting. This is accepted
  while the volunteers are people the owner knows personally.
- A lesson edited or deleted wrongly cannot be traced to a person. **Reopening
  trigger:** the first time the owner cannot answer "who changed this". That change
  would add a minimal log (who, what, when) and is its own record.
- An "editor" role with narrower rights is deferred, not rejected. Its trigger is a
  volunteer the owner does not know personally, or a circle too large to vet by phone.

## Rejected

- **An editor role first.** A schema change and a new permission surface for a gain
  the owner's by-phone onboarding does not need yet.
- **A gabbai account.** A synagogue's gabbai already has the place account; a rabbi's
  gabbai or assistant signs in with the rabbi's own account. 0015 already rejected one
  account spanning several rabbis.
- **A change log now.** Deferred to the trigger above, so the first version ships
  without a second table nobody has needed yet.
