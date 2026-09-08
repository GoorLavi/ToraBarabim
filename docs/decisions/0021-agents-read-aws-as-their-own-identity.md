# 0021: Agents read AWS as their own identity, never as the owner

- **Status:** accepted
- **Date:** 2026-09-08
- **Decided by:** project owner
- **Builds on:** [0006](0006-production-on-aws-with-cdk.md), which put production on AWS
  and left agent access undefined

## Context

The owner set out to grant an agent read access to AWS. Looking first found the opposite
of a gap: the `torabarabim` CLI profile on the owner's machine carries
`AdministratorAccess`, it renews itself through a stored refresh token, and an agent runs
shell commands as the owner's own user. Every agent already had unrestricted write access
to the account that holds the database, the site, and the only copy of the data. Nothing
was scoped, and nothing distinguished an agent's action from the owner's in any audit
trail.

Two further things were true and worth writing down. The AWS MCP connector was pointed at
a different account entirely, so the tool built for the job was reading the wrong
infrastructure. And the credentials file in the owner's home directory holds static keys
for that other account, readable by any agent in any session.

The risk that mattered was not an agent deciding to do harm. It was an agent making an
ordinary mistake with a command that had no business being able to succeed.

## Decision

**An agent is a separate AWS identity.** A dedicated IAM user, `claude-readonly`, with its
own long-lived key and its own name in CloudTrail. The owner's identity is no longer what
an agent acts as, so an agent's action and a human's action are now distinguishable after
the fact.

**Its permissions are shaped as "structure yes, contents no".** `ViewOnlyAccess` for the
shape of the infrastructure, plus a narrow inline policy for the three things that make a
deployed system debuggable and that view-only omits: CloudWatch log contents, the
CloudFormation templates CDK actually shipped, and secret names without their values.

**Four reads are denied explicitly rather than merely left ungranted:** S3 object
contents, Secrets Manager values, `kms:Decrypt`, and SSM parameter values. An explicit
`Deny` outranks any future `Allow`, so these survive someone later attaching a broad
policy to this user by mistake. Everything else is blocked by omission, which does not
survive that.

**The read-only profile is the default, not a convention.** `.claude/settings.json` sets
`AWS_PROFILE=claude-ro`, so an agent that types a plain `aws` command is already read
only. A `PreToolUse` hook blocks the owner's admin profile in both the `--profile` and the
`AWS_PROFILE=` form, because a permission rule matches a command's prefix and `aws` puts
`--profile` at the end.

**Verification is a permission simulation, not an attempted write.** The setup asks AWS
what the user may do and compares it against sixteen expectations. An earlier draft proved
the block by trying to create a bucket, which would have left a real bucket behind on the
day the block failed. A check that dirties the account when it fails is not a check.

## Consequences

**An agent can now be wrong without being expensive.** A malformed command fails instead
of destroying something, which is the failure mode this was built for.

**This is a guardrail, not a boundary.** An agent runs as the owner's user on the owner's
machine, so the admin credentials remain physically reachable on disk. The hook raises
the cost of reaching them from "typing a flag" to "deliberately evading a check", and the
explicit denies mean the read-only key cannot be widened by accident. Neither makes the
admin profile unreachable. A true boundary would mean an agent that never runs shell
commands as a user who holds admin credentials, and that is not where the project is.

**A long-lived access key now exists on disk.** That is the price of the owner not having
to re-authenticate an agent every session, which was the requirement. It has no rotation
schedule yet. Assuming a role from a short-lived session would avoid the standing key at
the cost of setup, and can supersede this later without changing anything else here.

**An agent can answer infrastructure questions from the infrastructure.** The region, the
database engine and size, what the running service is configured with, why a request
failed in the logs. Previously these were guessed from the CDK source, which describes
what was intended rather than what is running.

**Two gaps stay open on purpose.** The AWS MCP connector still points at the other
account, so infrastructure work goes through the shell rather than that tool. And the
static keys for that account remain readable in the owner's home directory. Both are out
of scope here and neither is fixed by this record.

## What was rejected

**`ReadOnlyAccess`, the obvious managed policy.** Reading its current version rather than
trusting its name showed it already excludes Secrets Manager values and `kms:Decrypt`, so
it was safer than expected. It still grants S3 object contents and DynamoDB rows, which
serve no purpose here. Rejected for granting data access that was never asked for.

**Keeping the admin profile with a promise to only read.** Nothing enforces a promise, and
the concern was an honest mistake, which a promise does not prevent.

**Permission deny rules alone, without the hook.** They match a command's prefix, so
`aws s3 rb s3://bucket --profile torabarabim` slips past a rule written against
`--profile`. The hook reads the whole command, which is what the check actually needs.
