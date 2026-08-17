# ToraBarabim infrastructure

The AWS CDK app defining production. Implements decision
[0006](../docs/decisions/0006-production-on-aws-with-cdk.md).

## One account, one profile, every time

This project deploys to exactly one AWS account, reachable only through the named CLI
profile `torabarabim`. The machine this normally runs from also has a different,
unrelated project as its default profile, in a different account. Every `cdk` command
below **must** be run with `--profile torabarabim`, e.g.:

```bash
npm run synth -w infra -- --profile torabarabim
npm run deploy -w infra -- TorabarabimNetwork --profile torabarabim
```

**Always run these through the `infra` workspace's npm scripts (`npm run <script> -w
infra -- ...`), never `npx --prefix infra cdk ...`.** `--prefix` only tells npx where to
find the `cdk` binary; it does not change the working directory, so `cdk` still runs from
the repo root, never finds `infra/cdk.json`, and fails with "--app is required either in
command-line, in cdk.json or in ~/.cdk.json". An npm workspace script runs with its own
package directory as the working directory, which is what makes `cdk.json` resolve.

The account id and region live only in the repo root `.env` (gitignored, never
committed): `TORABARABIM_AWS_ACCOUNT` and `TORABARABIM_AWS_REGION`, see `.env.example`.
`bin/infra.ts` reads them and pins every stack's `env` to that account and region. If
either variable is missing, the app throws before synthesizing anything, naming the
variable and the file to fix.

Pinning the account is what makes `cdk`'s own environment check catch a wrong profile
before anything is created. Run a command without `--profile torabarabim` (so the
default profile's credentials are used instead) and, because the stacks now name this
project's own account explicitly, `cdk` tries to look up context (availability zones,
for instance) in that account and fails loudly, instead of silently synthesizing or
deploying into the wrong one. The failure looks like this:

```
ERROR Could not assume role in target account using current credentials (which are for
account <other-account-id>) User: ... is not authorized to perform: sts:AssumeRole on
resource: arn:aws:iam::<this-project's-account-id>:role/cdk-hnb659fds-lookup-role-... . Please make
sure that this role exists in the account. If it doesn't exist, (re)-bootstrap the
environment with the right '--trust', using the latest version of the CDK CLI.
```

If you see this, you forgot `--profile torabarabim`. It is not a bug and not a sign
the account needs re-bootstrapping.

Four or five stacks, deployed together, depending on the mode below:

**Step one**, region `eu-central-1`:

- `TorabarabimNetwork`: the VPC (two AZs, no NAT gateway), and the three security groups
  shared between the database and the server.
- `TorabarabimDatabase`: RDS Postgres, `db.t4g.micro`, isolated subnets, seven days of
  backup, deletion protection on, and a removal policy that keeps the database when the
  stack is destroyed.
- `TorabarabimServer`: ECS Fargate running the API image, an API Gateway HTTP API
  reaching it over a VPC Link and Cloud Map, the migration task definition, and the
  CloudWatch alarms plus SNS topic for alerting.

**Step two**, the static client and the images bucket, plus the domain if there is one:

- `TorabarabimCertificate`, region `us-east-1`, **only deployed when a domain is
  supplied**: the ACM certificate covering the domain and `www`. Forced into `us-east-1`
  because CloudFront only accepts a certificate issued there, regardless of where the
  rest of the app lives.
- `TorabarabimSite`, region `eu-central-1`: the private client bucket, the public photo
  bucket, the one CloudFront distribution, and, only with a domain, the Route 53 alias
  records.

## Two modes: with or without a domain

The intended domain is `torahbarabim.com`, but its registration failed inside AWS and is
sitting on a support case with no known resolution date. Rather than block going live on
that, the domain is optional CDK context (`-c domain=torahbarabim.com`), and the app has
two coherent modes instead of one working mode plus a stuck one:

- **No domain (today's mode).** Omit `-c domain=...` entirely. `TorabarabimCertificate`
  is never instantiated, `TorabarabimSite` declares no `CertificateArn` or `HostedZoneId`
  parameter, requests no hosted zone, and writes no Route 53 record. CloudFront issues
  its own `*.cloudfront.net` name and serves on its default certificate. The site is
  fully live and usable, just at an ugly address. This is the mode to use **right now**.
- **With a domain.** Supply `-c domain=torahbarabim.com` (or the equivalent in a
  gitignored `cdk.context.json`). Exactly today's original behaviour: certificate plus
  alias records for the apex and `www`. Use this once the AWS support case resolves and
  the domain registration exists.

There is no third, half-configured mode: a domain is either fully wired (certificate,
both alias records) or entirely absent from the stack. `bin/infra.ts` accepts a missing
`domain` context value but rejects an empty string, so an empty `-c domain=` cannot
silently produce a half-built site.

**Attaching the domain later is an in-place update, not a rebuild.** `domainNames` and
`certificate` are plain, mutable properties of `AWS::CloudFront::Distribution`; adding
them updates the existing distribution (same distribution id, same cache, same CloudFront
address keeps working) rather than replacing it. Nothing about the client bucket, the
photo bucket, the API behavior, or the OAC wiring changes between modes. The one thing
that is genuinely different, and that the human will hit, is `CorsOrigins`: see
"Attaching the domain later" below.

**What the no-domain mode does not give you:** no `www.` alias (there is no domain to
alias), TLS is pinned to whatever security policy CloudFront's default certificate uses
rather than the `TLS_V1_2_2021` minimum the domain mode sets explicitly, and the address
visitors see is not memorable and will change if the distribution is ever replaced. None
of that affects correctness of the app itself, admin auth, or the API.

## Why no ALB, why no NAT gateway

An idle Application Load Balancer costs about 16 dollars a month regardless of traffic.
API Gateway costs about a dollar per million requests, which at this project's traffic
is effectively free, so ingress goes API Gateway HTTP API -> VPC Link -> Cloud Map ->
Fargate task instead.

A NAT Gateway costs more per month than every other resource in this stack combined. The
Fargate task instead runs in a public subnet with a public IP, used only for outbound
traffic (pulling its image, reaching Secrets Manager). Inbound access to the task is
still restricted to the VPC Link's security group only; nothing on the internet can
reach the task directly. The database has no public IP and sits in isolated subnets with
no route to the internet at all.

## Step one does not serve images until step two exists

The S3 bucket for rabbi photos is created in `TorabarabimSite` (step two).
`StorageBucketName` and `StoragePublicBaseUrl` are `TorabarabimServer` parameters with no
default: until `TorabarabimSite` creates the bucket and its outputs are fed back in as
described below, the API server will boot with whatever placeholder values are supplied
and any upload or image fetch will fail.

There is no `StorageAccessKeyId` or `StorageSecretAccessKey` parameter: the Fargate task
authenticates to the photo bucket as itself, through an IAM policy `TorabarabimSite`
attaches to the task role (see `ServerTaskRoleArn` below), not a long-lived access key.
`server/src/config.ts` only requires a key pair when `STORAGE_ENDPOINT` is set (MinIO,
locally); it is left unset in production, so the AWS SDK falls back to the task's role.

## One-directional dependency between TorabarabimServer and TorabarabimSite

`TorabarabimSite` reads `TorabarabimServer`'s API Gateway directly (for the `/v1/*`
CloudFront behavior), so it depends on `TorabarabimServer` and must be deployed after it.
The reverse never happens as a CDK-level reference: granting the photo bucket to the task
role from inside `TorabarabimSite` would otherwise attach a policy in
`TorabarabimServer` that names `TorabarabimSite`'s bucket, and two stacks depending on
each other is a cycle CloudFormation refuses to deploy. Instead, `TorabarabimSite` takes
the task role's ARN as a plain `ServerTaskRoleArn` parameter (the `TaskRoleArn` output on
`TorabarabimServer`) and imports it as a mutable role, exactly the same "read one stack's
output, paste it as the next stack's parameter" pattern already used for the image bucket
values above.

## What the human does, in order, once the AWS account exists

All commands run from the repo root. Nothing here is run by an agent.

**This is the no-domain flow, today's mode**, since the domain registration is stuck on
an AWS support case. None of these commands pass `-c domain=...`. Once the support case
resolves, come back to "Attaching the domain later" below; nothing here needs to be
undone first.

### 1. Bootstrap the account (once per account)

Only `eu-central-1` needs bootstrapping for the no-domain flow: `us-east-1` is only used
by `TorabarabimCertificate`, which does not exist yet in this mode.

```bash
npm run synth -w infra -- --profile torabarabim   # sanity check first
npm run bootstrap -w infra -- aws://<ACCOUNT_ID>/eu-central-1 --profile torabarabim
```

### 2. Deploy the three step-one stacks

`TorabarabimServer` requires deploy-time parameters (`--parameters`). None of these are
committed anywhere; supply them on the command line or via a parameters file kept outside
git. `CorsOrigins` is a placeholder here, same as the storage parameters: the real value
is CloudFront's own address, only known after `TorabarabimSite` deploys in step 5.

```bash
npm run deploy -w infra -- TorabarabimNetwork TorabarabimDatabase TorabarabimServer \
  --profile torabarabim \
  --parameters TorabarabimServer:CorsOrigins=<placeholder-until-step-6> \
  --parameters TorabarabimServer:AlertEmail=<your-email> \
  --parameters TorabarabimServer:StorageBucketName=<placeholder-until-step-6> \
  --parameters TorabarabimServer:StoragePublicBaseUrl=<placeholder-until-step-6>
```

This builds the server's Docker image locally (Docker must be running), pushes it to a
CDK-managed ECR repository, and provisions the VPC, the database, and the service. First
deploy takes a while: RDS instance creation alone is typically 10 to 15 minutes.

The database's master credentials, the session secret, and the composed `DATABASE_URL`
are all generated into Secrets Manager by the stack itself; nothing is typed in by hand.

### 3. Run the migration, by hand, once the stacks are up

The migration task definition is registered but never run automatically. Read its ARN,
the cluster name, a public subnet id, and the server security group id from the
`TorabarabimServer` stack outputs (`aws cloudformation describe-stacks --stack-name
TorabarabimServer --profile torabarabim`), then:

```bash
aws ecs run-task \
  --profile torabarabim \
  --cluster <ClusterName output> \
  --task-definition <MigrationTaskDefinitionArn output> \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<one id from PublicSubnetIds output>],securityGroups=[<ServerSecurityGroupId output>],assignPublicIp=ENABLED}"
```

Watch it finish in the ECS console or via `aws ecs describe-tasks --profile torabarabim`, then check the
`migrate` log stream in the `ServerLogGroup` CloudWatch log group for `drizzle-kit`'s
output. Re-run this exact command for every future migration; it always runs the
`server/drizzle` SQL files baked into the image that was deployed most recently.

### 4. Create the admin user, over ECS Exec

The server task has [ECS Exec](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html)
enabled (`enableExecuteCommand: true` on the service), so the human can open an
interactive shell inside the running container and run the same `admin:create` script
used locally. This is deliberate, not a shortcut: the script prompts for the password
with terminal echo off when it has a TTY (`server/src/scripts/create-admin.ts`), so the
password is never a CLI argument, never an environment variable, and never a task
definition override. A `run-task` with the password passed in as an override would put a
live admin credential into the task definition's revision history and into CloudTrail,
both of which are retained; typing it at an interactive prompt avoids that entirely.

Find the running task, then open the shell:

```bash
aws ecs list-tasks \
  --profile torabarabim \
  --cluster <ClusterName output> \
  --service-name <ServiceName output> \
  --desired-status RUNNING

aws ecs execute-command \
  --profile torabarabim \
  --cluster <ClusterName output> \
  --task <task id from the command above> \
  --container Server \
  --interactive \
  --command "/bin/sh"
```

Inside the shell, run the compiled script directly (the production image has no `tsx`,
only the built `dist/`; `DATABASE_URL` is already in the container's environment from
Secrets Manager):

```sh
node dist/scripts/create-admin.js <email> <name>
```

It prompts for the password twice, with the terminal not echoing what is typed.

**On the session log:** ECS Exec sends the session transcript to the same
`ServerLogGroup` CloudWatch log group as the server's own logs, at the same one-month
retention (set via the cluster's `executeCommandConfiguration`, instead of the
AWS-managed, unbounded-retention default). The password prompt's raw-mode input
suppresses the terminal's own character echo (`stdin.setRawMode(true)`, confirmed in the
script's own comments), and ECS Exec's CloudWatch logging is a recording of the session's
*output* stream, the same thing a person watching the screen would see, not a separate
raw keystroke logger of the input channel. On that basis the typed password should not
land in the session log. This has not been verified against a live session, since there
is no AWS account yet to test against: **the first time this is used, check the
`ServerLogGroup` session log stream immediately afterward and confirm the password did
not appear before relying on this for a real credential.** If it did appear, that changes
the recommendation and this section needs a rewrite before it is used again.

**Standing exposure:** ECS Exec is a permanent door into the running container for
anyone with `ecs:ExecuteCommand` IAM permission on this cluster, not a one-time
mechanism that closes itself. It does not open anything to the public internet, but it
does let any human or automation with that IAM permission get an interactive shell with
the task's own role and see everything the container can see, including reading
`DATABASE_URL` and the other secrets straight out of its environment. Once the first
admin user exists, consider turning it off by setting `enableExecuteCommand: false` on
the service and redeploying.

### 4a. Seed the official locality list, over ECS Exec

`GET /v1/cities` returns nothing and the public search cannot work until the roughly
1,300 official Israeli localities are in the database. There are two seed scripts and
they are not interchangeable: `db:seed` also invents sample lessons for local
development and must **never** run against production (decision
[0001](../docs/decisions/0001-lessons-are-admin-entered.md): a lesson that is not really
happening is worse than a lesson that is missing). `db:seed:cities-only` seeds the
locality table alone and nothing else, and is safe to run here.

It fetches the locality and population datasets live from `data.gov.il`, so it needs
outbound internet; the task already has it (see "Why no ALB, why no NAT gateway" above).
It upserts on the official locality code, so running it again later, when the source
data updates, updates rows in place instead of duplicating them.

Find the running task and open the shell exactly as in step 4:

```bash
aws ecs list-tasks \
  --profile torabarabim \
  --cluster <ClusterName output> \
  --service-name <ServiceName output> \
  --desired-status RUNNING

aws ecs execute-command \
  --profile torabarabim \
  --cluster <ClusterName output> \
  --task <task id from the command above> \
  --container Server \
  --interactive \
  --command "/bin/sh"
```

Inside the shell, run the compiled script directly (same reasoning as step 4: the
production image has no `tsx`, only the built `dist/`):

```sh
node dist/db/seed-cities-only.js
```

It prints how many localities it inserted or updated (about 1,310) and exits. If the
fetch from `data.gov.il` fails, it exits non-zero and writes nothing: it runs inside a
single transaction, so a failed fetch or a failed upsert never leaves the table half
filled.

### 5. Deploy `TorabarabimSite` (eu-central-1), no domain

```bash
npm run deploy -w infra -- TorabarabimSite \
  --profile torabarabim \
  --parameters TorabarabimSite:ServerTaskRoleArn=<TaskRoleArn output on TorabarabimServer>
```

No `CertificateArn` or `HostedZoneId` parameter exists on this stack without `-c
domain=...`: it is never declared, so there is nothing to omit-and-hope, `cdk deploy`
simply does not ask for it. Creates the private client bucket, the public photo bucket
(and grants it to the server's task role), and the CloudFront distribution on its own
generated address. Read the `SiteUrl`, `PhotoBucketName`, and `PhotoBucketPublicBaseUrl`
outputs for the next step.

### 6. Feed the photo bucket and the real site address back into `TorabarabimServer`, and redeploy it

```bash
npm run deploy -w infra -- TorabarabimServer \
  --profile torabarabim \
  --parameters TorabarabimServer:CorsOrigins=<SiteUrl output> \
  --parameters TorabarabimServer:AlertEmail=<your-email> \
  --parameters TorabarabimServer:StorageBucketName=<PhotoBucketName output> \
  --parameters TorabarabimServer:StoragePublicBaseUrl=<PhotoBucketPublicBaseUrl output>
```

Two things turn on here at once: image upload (the server has been up since step 2 but
every upload or photo fetch has been failing against whatever storage placeholder was
supplied there), and the admin panel actually being able to call the API (the server
otherwise has no allowed origin to accept a browser request from). **`CorsOrigins` must
be exactly the `SiteUrl` output**, e.g. `https://d111111abcdef8.cloudfront.net`, no
trailing slash. Getting this wrong does not fail loudly: it shows up as every admin-panel
request being blocked by CORS in the browser console, not as a 5xx anywhere in the
server's own logs.

### 7. Get the client build into the bucket

Not part of this CDK app; decision 0006 puts automatic deploys from `main` on GitHub
Actions, not yet built. Until that workflow exists, by hand from the repo root:

```bash
VITE_API_URL=<ApiUrl output on TorabarabimServer> npm run build -w client
aws s3 sync client/dist s3://<ClientBucketName output> --delete --profile torabarabim
aws cloudfront create-invalidation --distribution-id <DistributionId output> --paths "/*" --profile torabarabim
```

**`VITE_API_URL` is baked into the built files at this build step, not read at
runtime.** The site must be rebuilt and re-uploaded every time that URL changes. Vite
now fails this build outright if `VITE_API_URL` is missing, on purpose: without that
check the build succeeds silently and ships a site whose every API call targets the
visitor's own machine (`http://localhost:3000`) instead of the real API.

The invalidation matters: CloudFront's default cache policy on the client behavior would
otherwise keep serving the previous build's `index.html` for a while after a new one is
uploaded.

The site is now live at the `SiteUrl` output.

## Attaching the domain later, once the support case resolves

None of the above needs to be torn down first. These steps update the stacks already
deployed; the CloudFront distribution, its cache, and its existing `*.cloudfront.net`
address keep working throughout (the `*.cloudfront.net` address stops resolving to the
distribution once you point DNS at the new one in step D, but the distribution itself is
never replaced).

### A. Register `torahbarabim.com` in Route 53

Done once, by hand, in the Route 53 console or with `aws route53domains
register-domain --profile torabarabim`, outside this CDK app. Registration auto-creates a
public hosted zone; note its id (`aws route53 list-hosted-zones-by-name --dns-name
torahbarabim.com --profile torabarabim`), needed as `HostedZoneId` in the next two steps.

### B. Bootstrap `us-east-1`

Only needed now, because `TorabarabimCertificate` deploys there and did not exist before.

```bash
npm run bootstrap -w infra -- aws://<ACCOUNT_ID>/us-east-1 --profile torabarabim
```

### C. Deploy `TorabarabimCertificate` (us-east-1)

```bash
npm run deploy -w infra -- TorabarabimCertificate \
  --profile torabarabim \
  -c domain=torahbarabim.com \
  --parameters TorabarabimCertificate:HostedZoneId=<zone id from step A>
```

Imports the hosted zone Route 53 already created in step A (never creates a new one: a
second zone for the same name would have different name servers than the ones the domain
registration already points at) and requests a DNS-validated certificate against it.
Since the zone already exists and is already the one the domain resolves through,
validation completes without any manual DNS handoff. Keep the `CertificateArn` output for
the next step.

### D. Redeploy `TorabarabimSite` (eu-central-1), now with the domain

```bash
npm run deploy -w infra -- TorabarabimSite \
  --profile torabarabim \
  -c domain=torahbarabim.com \
  --parameters TorabarabimSite:CertificateArn=<CertificateArn output> \
  --parameters TorabarabimSite:HostedZoneId=<zone id from step A> \
  --parameters TorabarabimSite:ServerTaskRoleArn=<TaskRoleArn output on TorabarabimServer>
```

This is an update to the same distribution deployed in step 5, not a new one: CDK adds
`domainNames` and `certificate` to the existing `AWS::CloudFront::Distribution` resource
and CloudFormation applies it in place. It also now creates the Route 53 A/AAAA records
for the apex and `www`, which did not exist before. The client bucket, the photo bucket,
and everything already uploaded to them are untouched.

### E. Redeploy `TorabarabimServer` with the real `CorsOrigins`

```bash
npm run deploy -w infra -- TorabarabimServer \
  --profile torabarabim \
  --parameters TorabarabimServer:CorsOrigins=https://torahbarabim.com \
  --parameters TorabarabimServer:AlertEmail=<your-email> \
  --parameters TorabarabimServer:StorageBucketName=<PhotoBucketName output> \
  --parameters TorabarabimServer:StoragePublicBaseUrl=<PhotoBucketPublicBaseUrl output>
```

The `SiteUrl` output on `TorabarabimSite` now reads `https://torahbarabim.com`; this
parameter must track it. Until this redeploy runs, the CloudFront address from step 5
still works (its DNS did not change), but a browser visiting the new domain will have its
admin-panel requests blocked by CORS.

The invalidation matters: CloudFront's default cache policy on the client behavior would
otherwise keep serving the previous build's `index.html` for a while after a new one is
uploaded.

## Parameters the human must supply

| Parameter | Stack | Secret? | Notes |
| --- | --- | --- | --- |
| `CorsOrigins` | `TorabarabimServer` | no | Comma-separated list. Must be exactly the `SiteUrl` output on `TorabarabimSite`: the CloudFront address today, `https://torahbarabim.com` once the domain is attached |
| `AlertEmail` | `TorabarabimServer` | no | Receives an SNS confirmation email; must be confirmed before alerts arrive |
| `StorageBucketName` | `TorabarabimServer` | no | Placeholder until step 5, then the `PhotoBucketName` output |
| `StoragePublicBaseUrl` | `TorabarabimServer` | no | Placeholder until step 5, then the `PhotoBucketPublicBaseUrl` output |
| `HostedZoneId` | `TorabarabimCertificate`, `TorabarabimSite` | no | Domain mode only. The zone id Route 53 created when `torahbarabim.com` was registered |
| `CertificateArn` | `TorabarabimSite` | no | Domain mode only. Output of `TorabarabimCertificate` |
| `ServerTaskRoleArn` | `TorabarabimSite` | no | The `TaskRoleArn` output on `TorabarabimServer` |

CDK context `domain` (`-c domain=torahbarabim.com`) is optional, never hardcoded in a
stack file. Omit it for today's no-domain deploy; supply it once the domain is being
attached, see "Attaching the domain later" above. `HostedZoneId` and `CertificateArn` are
not declared on `TorabarabimSite` at all without it, so there is nothing to pass a
placeholder for in no-domain mode.

## Estimated monthly cost (US dollars)

| Item | Estimate |
| --- | --- |
| RDS `db.t4g.micro`, single-AZ, 20 GB gp2, encrypted | ~13 |
| RDS automated backup storage (within the 20 GB allocated, first month) | ~0 to 2 |
| Fargate task, 0.25 vCPU / 0.5 GB, ARM64, always on | ~7 |
| Public IPv4 address on the Fargate task | ~3.60 |
| API Gateway HTTP API, at this project's expected traffic | <1 |
| NAT Gateway | 0 (none deployed) |
| Application Load Balancer | 0 (none deployed) |
| Secrets Manager, 2 secrets (session secret, database URL) | ~0.80 |
| CloudWatch Logs, one month retention, low volume | ~1 to 2 |
| CloudWatch Alarms (2) + SNS (email) | <1 |
| S3, client bucket + photo bucket, ~1,000 images, low volume | ~1 |
| CloudFront, one distribution, low traffic | ~1 |
| Route 53 hosted zone (1, imported, not billed twice for the same domain) | ~0.50, domain mode only |
| Route 53 domain registration, `torahbarabim.com` (annual, amortized) | ~1, domain mode only |
| ACM certificate | 0 (ACM certificates for CloudFront are free) |
| Data transfer out, low traffic | ~1 to 3 |
| **Total** | **~30 to 35 with a domain, ~28.50 to 33.50 without one** |

Still inside decision 0006's 20 to 50 dollar budget, and close to step one's own 30 to 34
dollar estimate: CloudFront, S3, Route 53, and ACM add only a couple of dollars at this
traffic and image volume, per decision 0005's "on the order of a thousand images, so
storage cost is effectively noise." The no-domain total drops the two Route 53 line items
above (nothing to host or register without a domain) and otherwise does not change: every
other line item, including CloudFront itself, is identical between the two modes.

AWS bills every public IPv4 address by the hour (about $0.005/hour, roughly $3.60 for a
730-hour month) since February 2024, and this task has one by design: it is what lets a
Fargate task in a public subnet reach the internet without a NAT Gateway. That $3.60 a
month is still far cheaper than the NAT Gateway it replaces (a NAT Gateway alone runs
about $32/month before any data processing charges, before it would even need its own
public IP on top). During a redeploy, the circuit breaker settings
(`minHealthyPercent: 100`, `maxHealthyPercent: 200`) briefly run a second task alongside
the first so the service does not drop to zero, which briefly doubles both the Fargate
task-hour and the public-IPv4-address line for the few minutes a deploy takes; this is
not in the steady-state total above.

This excludes any RDS storage growth past 20 GB, any Fargate scaling beyond one task, and
any CloudFront or S3 cost growth well past the roughly 1,000-image, low-traffic volumes
decision 0005 and this project's current stage assume; none of those happen automatically.
