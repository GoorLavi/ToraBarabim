# 0010: The production shape, and what was traded for cost

- **Status:** accepted
- **Date:** 2026-08-14
- **Decided by:** project owner
- **Refines:** [0006](0006-production-on-aws-with-cdk.md), which chose AWS and CDK but
  not the shape inside them

## Context

Decision `0006` set a budget of 20 to 50 dollars a month. On AWS the default answers to
"how does traffic reach a container" and "how does a container reach the internet" cost
about 48 dollars a month between them, before a single request is served. The account
also turned out to be ineligible for new customer credits, so there is no runway: the
bill starts at full price on the first hour.

That makes the shape a cost decision, not a taste decision.

## Decision

**Region eu-central-1, Frankfurt.** Not il-central-1 in Tel Aviv, which is closer to the
entire audience but roughly 10 to 20 percent more expensive.

**Ingress is API Gateway HTTP API over a VPC Link, reaching the Fargate service through
Cloud Map.** Not an Application Load Balancer.

**No NAT Gateway.** The Fargate task runs in a public subnet with a public IP, used only
for outbound traffic: pulling its image and reading Secrets Manager. Inbound is
restricted by security group to the VPC Link alone. The database sits in isolated
subnets with no route to the internet at all.

**The database survives the stack.** Deletion protection is on and the removal policy
retains it, so `cdk destroy` cannot take the data with it.

**Migrations are a separate task the human runs by hand**, never on container start and
never as part of a deploy.

**The first admin user is created through a shell inside the running container**
(ECS Exec), typing the password at an interactive prompt.

Roughly 30 to 34 dollars a month at rest.

## Consequences

- **Every Israeli visitor pays about 60 extra milliseconds** on the first request. Real,
  and judged not worth 10 to 20 percent of the bill at this stage. Moving region later
  means moving the database, which is the expensive part.
- **A public IP on the task costs about 3.60 a month** and is easy to forget. It is the
  price of not running a NAT Gateway, which would cost roughly nine times that.
- **A public subnet holding the application is unusual and looks wrong at a glance.**
  The protection is entirely the security group. Anyone reviewing this later should
  understand it is deliberate before "fixing" it.
- **API Gateway is one more component to understand** when something breaks, and its
  logs and errors live somewhere different from an ALB's.
- **ECS Exec is a standing door into the running container.** Anyone with the IAM
  permission gets a shell holding the task's role, which can read the database URL and
  the session secret. It can and probably should be turned off after the first admin
  exists.
- **Whether the typed password appears in the ECS Exec session log is reasoned, not
  observed.** Raw mode disables terminal echo, and the session log records output rather
  than keystrokes, so it should not. This was never tested against a real session
  because no account existed at the time. Check the log stream the first time before
  trusting it with a real credential.
- **Static storage keys, not a task role.** The server's config requires an access key
  and secret unconditionally, because the same code path serves MinIO locally per
  `0005`. On AWS the task's own IAM role would be the better answer. Revisit when the
  bucket is built in step two.

## Rejected

- **An Application Load Balancer.** The standard, simplest to reason about, and about 16
  dollars a month sitting idle. At this traffic that buys nothing.
- **A NAT Gateway with tasks in private subnets.** The textbook layout, and about 32
  dollars a month: more than the rest of the system combined, to protect a container
  whose inbound access is already closed by a security group.
- **Tel Aviv region.** Better for every user, worse for the only constraint that was
  binding.
- **Running migrations automatically on deploy.** Convenient, and the way an unnoticed
  schema change quietly rewrites production data. House rules forbid it.
- **Creating the admin user with a one-off task and the password passed as a
  parameter.** Simpler, and it writes a live admin credential into the task definition
  revision history and CloudTrail, both of which are retained and readable.
