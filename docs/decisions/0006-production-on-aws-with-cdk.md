# 0006: Production runs on AWS, defined in CDK

- **Status:** accepted
- **Date:** 2026-08-14
- **Decided by:** project owner

## Context

The site needs somewhere to live. The project owner already works with AWS and with CDK
on another project, and set a budget of roughly 20 to 50 dollars a month. That budget is
the binding constraint, not a preference.

## Decision

Everything on AWS, with the infrastructure defined in CDK and kept in this repository.

- **API:** a container on Fargate, always running.
- **Database:** the smallest RDS Postgres instance, with seven days of point in time
  backup.
- **Images:** S3, per `0005`.
- **Client:** static files on S3 behind CloudFront.
- **Domain:** bought inside AWS through Route 53.
- **Deploys:** automatic from `main` via GitHub Actions.
- **Environments:** production in the cloud, and each developer's own machine. There is
  no staging environment.
- **Alerting:** an email when the site stops answering or errors spike.

Fargate was chosen over Lambda specifically because the database is RDS. Lambda would
need to sit inside the database's private network, where each concurrent execution opens
its own connection and exhausts the instance; the AWS answer to that costs about fifteen
dollars a month, which erases the saving that motivated Lambda in the first place.
Lambda remains the better shape only if the database is ever swapped for one reachable
over the public internet.

## Consequences

- Roughly 30 to 40 dollars a month at rest, inside the stated budget, and largely fixed
  rather than traffic dependent.
- No staging means a change is verified locally and then goes live. With automatic
  deploys from `main`, `main` must always be releasable.
- Seven days of backup is the entire recovery story for the destructive delete in
  `0004`. Beyond seven days, a wrong deletion is unrecoverable.
- CDK is now a dependency of shipping. Anyone who deploys needs AWS credentials and CDK
  installed.
- Secrets stay with the project owner. Agents never hold AWS credentials and never
  deploy.

## Rejected

- **Railway or Render.** Less to maintain and the original recommendation, but the owner
  is already on AWS and wanted one place.
- **Aurora Serverless that scales to zero.** Cheaper at rest and better backups, but
  less predictable monthly cost; the owner preferred a fixed number.
- **A single EC2 machine running everything.** Cheapest, at the price of owning
  operating system patching and uptime by hand.
- **Deploying by hand from a laptop.** Fine on day one, and the reason a release later
  depends on one person being awake.
