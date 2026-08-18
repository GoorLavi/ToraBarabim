# 0011: Deploys run themselves, migrations wait for a human

- **Status:** accepted
- **Date:** 2026-08-18
- **Decided by:** project owner
- **Fulfils:** [0006](0006-production-on-aws-with-cdk.md), which promised automatic
  deploys from `main` and left them unbuilt

## Context

Until now every deploy was the owner typing commands: build the image, update the
service, run the migration, build the client with the right API address, upload it,
invalidate the cache. Six commands in a fixed order, where getting the order wrong is
silent. The first live deploy produced four defects, three of them the same shape: a
default that is correct on a development machine and wrong in the cloud, substituted
without a word. Two of those three were ordering or configuration mistakes that a
pipeline does not make twice.

At the same time the rulebook is explicit that a migration is never applied by an agent
or a script on its own, and [0008](0008-no-automated-tests-yet.md) means there is no
test suite standing between a wrong schema change and the only copy of the data.

Those two pull in opposite directions. Automating everything would quietly delete the
migration rule. Automating nothing would leave the promise of `0006` unkept and the
ordering trap in place.

## Decision

**The application deploys itself on every push to `main`.** The server image and the
client site, in that order, with the client built against the API address read from the
stack outputs at deploy time rather than typed by hand.

**Infrastructure does not.** The network, the database, and the stacks themselves stay
manual. They change rarely, and a mistake in them can destroy a resource rather than
replace a container.

**A migration runs inside the pipeline and stops for a human.** The run pauses at a
GitHub Environment with the owner as required reviewer, shows what is about to be
applied, and continues only when he clicks. The migration therefore runs before the code
that depends on it, which hand-running never guaranteed, while the rule that no schema
change reaches the database unwatched survives intact.

**A pull request that adds a migration says so on the pull request itself.** "Does this
change the schema?" stops being something a reviewer has to remember to check.

**GitHub authenticates with no stored key.** It proves its identity per run and receives
temporary permission, trusted only from this repository, only on `main`, and only
through the approval gate. There is no secret to leak, rotate, or forget.

**Production database access for a human goes through a tunnel, not an open door.** The
database keeps no route from the internet. A local client reaches it by forwarding a
port through the already-running container, on local port 5434 so it can never be
mistaken for the development database on 5433.

## Consequences

**A push to `main` is now a deploy.** There is no staging environment and no review app;
what merges is what serves. The owner is the only committer today, so the protection is
his own discipline, not a process.

**The deploy role's permissions are broader than they should be** in two places. The ECS
cluster, service, and client bucket were created without fixed names, so the policy can
only be scoped to the account and region rather than to those exact resources. Naming
them would let it narrow, and that work is not done.

**Nothing guards against a breaking API change** reaching a visitor who still holds a
cached copy of the old site. The protection is additive changes by habit, not a
mechanism.

**The tunnel is a real path to the live data.** Anyone who can assume the role and reach
the container can reach the database. It is logged, it opens nothing to the internet,
and it is still the shortest route between a tired evening and an irreversible cascading
delete under [0004](0004-deleting-a-rabbi-deletes-their-lessons.md).

**None of this has been exercised.** The workflows parse and the infrastructure
synthesizes, but no pipeline run has happened. The first push to `main` is the first
test of the thing that deploys.

## What was rejected

**Fully automatic migrations.** The pipeline would be simpler and faster, and every
guard against a destructive schema change would be a habit rather than a gate. Revisit
when there are tests worth trusting, which `0008` defers.

**Leaving migrations entirely manual.** Keeps today's rule with zero work, and keeps
today's trap: code deploys itself while the schema it needs waits for someone to
remember.

**Deploying infrastructure from `main` too.** More consistent, and a bad line in a stack
file could take the database with it. Not worth it at this size.

**A stored access key for GitHub.** Ten minutes of setup instead of an hour, and a
permanent credential sitting with a third party, which is the exact risk the account was
moved off long-lived keys to avoid.

**Opening the database to the internet for a client tool.** One checkbox, and it undoes
the main protection [0010](0010-production-shape-traded-for-cost.md) bought.
