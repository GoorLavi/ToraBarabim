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

Five or six stacks total, depending on the mode below.

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

**Deployed once, independently of the other two steps:**

- `TorabarabimGitHubDeployRole`, region `eu-central-1`: the GitHub OIDC identity provider
  and the one IAM role GitHub Actions assumes to deploy. See "Automatic deploys from
  `main`" below.

## Two modes: with or without a domain

The site runs on `torahbarabim.com`. Registering it inside AWS failed and sat on a
support case with no resolution date, so it was bought at **Porkbun** instead and the
hosted zone was created here by hand. Registrar and DNS are separate jobs: AWS serves
the records regardless of who sold the name.

The domain stays optional CDK context (`-c domain=torahbarabim.com`) because the site
shipped without it first, and because that is the path any future domain change repeats:

- **No domain.** Omit `-c domain=...` entirely. `TorabarabimCertificate` is never
  instantiated, `TorabarabimSite` declares no `CertificateArn` or `HostedZoneId`
  parameter, requests no hosted zone, and writes no Route 53 record. CloudFront issues
  its own `*.cloudfront.net` name and serves on its default certificate. Fully live and
  usable, just at an ugly address.
- **With a domain (today's mode).** Supply `-c domain=torahbarabim.com` (or the
  equivalent in a gitignored `cdk.context.json`): certificate plus alias records for the
  apex and `www`.

### The one thing that is not in code

The hosted zone was created with `aws route53 create-hosted-zone`, not by CDK, and its
four name servers were pasted at Porkbun by hand. This is deliberate: a zone described in
CDK would be destroyed and recreated with **different** name servers by any change that
replaces it, silently breaking the domain until someone pasted the new ones at the
registrar. The zone is therefore imported by id everywhere it is used.

Read the current zone id and its name servers with:

```bash
aws route53 list-hosted-zones-by-name --dns-name torahbarabim.com --profile torabarabim
```

Both certificates renew themselves against this zone with no further action. That
automatic renewal is the reason the domain is served from Route 53 rather than from the
registrar's own DNS.

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

This step is now automatic: see "Automatic deploys from `main`" below. It is documented
here, by hand, only for the one time before that pipeline's one-time setup is done, or if
it ever needs to be reproduced manually:

```bash
npm run build -w client
aws s3 sync client/dist s3://<ClientBucketName output> --delete --profile torabarabim
aws cloudfront create-invalidation --distribution-id <DistributionId output> --paths "/*" --profile torabarabim
```

**No API address is supplied to this build, and none may be.** The client calls
`/v1/...` against whatever origin served it, which the distribution's `/v1/*` behavior
forwards to the API. This is what keeps the admin session cookie same-site, and it is
what makes the build correct on the apex, on `www`, and on the `*.cloudfront.net`
address alike, with no value to keep in sync. An earlier version of this step baked the
`ApiUrl` output into the bundle; that shipped a site the admin panel could not log in
to, because a `SameSite=Lax` cookie set by a cross-site response is discarded by the
browser.

The invalidation matters: CloudFront's default cache policy on the client behavior would
otherwise keep serving the previous build's `index.html` for a while after a new one is
uploaded.

The site is now live at the `SiteUrl` output.

## Automatic deploys from `main`

Decision [0006](../docs/decisions/0006-production-on-aws-with-cdk.md) promised automatic
deploys from `main`; `.github/workflows/deploy.yml` (push to `main`) and
`.github/workflows/ci.yml` (every pull request) are that pipeline. This section is what a
human needs to know to set it up once, approve a migration, and recover from a failed run.

### What deploys automatically, and what stays manual

**Automatic, on every push to `main`:**
- Type check and build every workspace. A broken build stops here and nothing below it
  runs.
- Build the server's `runtime` Docker image from that commit, push it to the same ECR
  repository `cdk deploy` already uses, register a new revision of the **already
  deployed** ECS task definition pointing at it, and update the running service, waiting
  for it to stabilize.
- If, and only if, the commit added a new file under `server/drizzle/*.sql`: build the
  `migrate` Docker image the same way, register a new revision of the **already
  deployed** migration task definition, and run it exactly the way step 3 above does,
  after a human approves it (see "Approving a migration" below). Runs before the server
  update, so the new code is never running against a database it does not expect yet.
- Build the client, sync it to the client bucket, and invalidate the CloudFront cache.
  The build reads no stack output and needs no AWS credentials: the site calls the API
  on its own origin, so there is no address to look up.

**Stays manual, on purpose, per the brief this pipeline implements:** every `cdk deploy`
of `TorabarabimNetwork`, `TorabarabimDatabase`, `TorabarabimServer`, `TorabarabimSite`, or
`TorabarabimCertificate` itself. The pipeline only ever swaps the image inside an
already-deployed ECS task definition; it never touches a stack's own shape (the VPC, the
database, the alarms, the API Gateway wiring, the CloudFront behaviors). A network,
database, or infrastructure change is rare and a mistake in it is expensive, so it keeps
requiring the same steps 1 to 6 above, run by hand.

**On every pull request** (`.github/workflows/ci.yml`), nothing deploys and no AWS
credentials are used at all: every workspace is type-checked, the server is built, and
the client is built once against a placeholder API URL, purely to prove the build itself
succeeds. A pull request that adds a file under `server/drizzle/*.sql` gets a comment on
the PR itself, naming the files: the loudest of the options the brief allowed, since it
appears in the conversation without a reviewer needing to remember to open the Checks tab.

### How GitHub authenticates: no stored keys

`TorabarabimGitHubDeployRole` (`infra/lib/github-deploy-role-stack.ts`) is an IAM OIDC
identity provider for `token.actions.githubusercontent.com` plus one role,
`TorabarabimGitHubDeploy`, that only this repository's workflows can assume, and only in
one of two situations:

- a workflow job running directly on a push to `main`
  (`repo:GoorLavi/ToraBarabim:ref:refs/heads/main`)
- a workflow job gated behind the `production-migrations` GitHub Environment, whose `sub`
  claim GitHub replaces with the environment form instead of the ref form
  (`repo:GoorLavi/ToraBarabim:environment:production-migrations`)

No AWS access key is ever created or stored in GitHub. A pull request, a branch other than
`main`, or any other repository can never produce a token matching either condition.

### One-time setup, by hand

1. Deploy the role stack once, the same way as any other stack:
   ```bash
   npm run deploy -w infra -- TorabarabimGitHubDeployRole --profile torabarabim
   ```
   Read the `RoleArn` output.
2. In the GitHub repository's Settings > Secrets and variables > Actions > Variables, add
   a repository variable named `AWS_DEPLOY_ROLE_ARN` set to that output. It is a role ARN,
   not a credential: knowing it grants nothing without also meeting the trust conditions
   above, so a plain (non-secret) repository variable is enough.
3. In Settings > Environments, create an environment named exactly `production-migrations`
   (must match `MIGRATION_ENVIRONMENT_NAME` in `infra/lib/github-deploy-role-stack.ts` and
   the `environment:` key on the `migrate` job in `deploy.yml`) and add yourself as a
   required reviewer. This is what makes the migration step in the pipeline pause for a
   real approval instead of running unattended.

### Approving a migration

When a push to `main` includes a new file under `server/drizzle/*.sql`, the `migrate` job
in the Actions run for that push waits in "Waiting" state for the `production-migrations`
environment's required reviewer. Open the run, review what changed (the PR that introduced
it already carried a comment naming the files, per "On every pull request" above), and
approve or reject it from the run's page. Nothing after it (the server update, the client
deploy) starts until this is resolved one way or the other. When a push carries no new
migration file, this job is skipped entirely and nothing waits on anyone.

### Recovering from a deploy that failed halfway

Every job downstream of a failure simply does not run; nothing rolls back automatically.

- **Build or type check failed:** nothing was pushed or touched. Fix the code and push
  again.
- **Migration task failed** (nonzero exit code): the server is not updated and the client
  is not deployed, so production keeps running the previous release against the
  previous schema. Read the `migrate` log stream in the `ServerLogGroup` CloudWatch log
  group (same place step 3 above points at) for `drizzle-kit`'s output, fix the migration,
  and push again.
- **Server update failed or the service never stabilized:** the ECS circuit breaker
  (`minHealthyPercent: 100`, `maxHealthyPercent: 200`, set on the service in
  `TorabarabimServer`) rolls the service back to the previous task definition revision on
  its own; a failed deploy here should self-heal within a few minutes without losing
  traffic. Confirm in the ECS console or `aws ecs describe-services`.
- **Client sync or invalidation failed after the server already updated:** the API is on
  the new code, the client bucket may be mid-sync or the CloudFront cache not yet
  invalidated. Re-run the `deploy-client` job from the failed workflow run (Actions >
  the run > Re-run failed jobs); it rebuilds nothing new, it re-syncs the same artifact.

### What a visitor sees mid-deploy

- **While the server updates:** the ECS circuit breaker keeps the previous task running
  alongside the new one until the new one passes its health check, so a visitor's request
  is never dropped; it lands on whichever task is currently healthy. There is no
  zero-downtime guarantee stronger than that (a request mid-flight to a task that is being
  drained could still see a connection reset), but there is no window where the API is
  fully down.
- **Between the server update finishing and the client deploy finishing:** none, in
  practice, for a change that only touches the server. The client bundle does not embed
  server response shapes at build time beyond what it already expects; a client built
  against yesterday's API and a server already running today's code coexist safely as
  long as the API response shape did not change in a way the deployed client cannot
  handle. **This is the one real gap:** the pipeline has no mechanism to detect or block
  an API response shape change that is not backward compatible with whatever client build
  is still live in CloudFront for however long the deploy takes. Keep server API changes
  additive, the same "add before you remove" discipline the root rulebook already asks of
  a migration.
- **While the client syncs and the CloudFront invalidation runs:** a visitor loading the
  site can, for a few seconds to a couple of minutes, receive either the previous or the
  new `index.html` depending on which edge cache location answers and whether the
  invalidation has reached it yet. Both versions of the client work against the API that
  is live at that moment (see above), so this is a brief inconsistency in which static
  bundle a visitor gets, not a broken page.

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

## Connecting a local database client (DBeaver) to production

The database has no route to the internet at all (see "Why no ALB, why no NAT gateway"
above) and that stays true here: nothing is opened publicly and no bastion host is
added. Instead, the tunnel goes through the running server task itself, which already
has [ECS Exec](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html)
enabled. AWS Systems Manager can port-forward through that task to any host the task can
reach, including the RDS endpoint in its isolated subnet, using the
`AWS-StartPortForwardingSessionToRemoteHost` session document. Nothing new is created in
AWS to make this work.

**One command, from the repo root:**

```bash
npm run db:tunnel
```

`infra/scripts/db-tunnel.sh` does the rest: checks the AWS CLI and the Session Manager
plugin are installed, checks the `torabarabim` profile's credentials are live, finds the
currently running server task and its container runtime id, reads the database endpoint
from the `TorabarabimDatabase` stack, and opens the tunnel. Nothing it uses is
hardcoded: the cluster, service, task, and database endpoint are all read live from AWS
each time, since every one of them can change on a redeploy or a failover.

**What DBeaver needs typed into a new PostgreSQL connection**, while the script is
running:

| Field | Value |
| --- | --- |
| Host | `localhost` |
| Port | `5434` |
| Database | printed by the script (currently `torabarabim`) |
| User | printed by the script (currently `torabarabim_app`) |
| Password | see below, never printed by the script |

**Port 5434 is deliberate, not 5432 or 5433.** Local development Postgres already
listens on 5433. A tunnel that quietly reused 5432 or 5433 would let a query meant for a
local database land on production instead, or the reverse, with nothing to notice until
data is gone. The script prints a loud banner every time it starts, naming the port and
saying plainly that it points at production.

**The password is never printed by the script.** It comes from Secrets Manager; the
script prints the exact command, with the correct secret ARN already filled in, once it
has resolved the database:

```bash
aws secretsmanager get-secret-value --secret-id <printed by the script> \
  --profile torabarabim --region eu-central-1 --query SecretString --output text
```

Running that command puts a live production credential in plain text on your screen and,
depending on your shell's history settings, in your shell history. Read it, paste it into
DBeaver, and clear your terminal scrollback and history entry for that line afterward if
that machine is shared or backed up anywhere.

**Closing the tunnel:** `Ctrl+C` in the terminal running `npm run db:tunnel`. It is a
foreground SSM session; there is nothing else to clean up, and no AWS resource was
created that needs tearing down.

**If your session has expired**, which happens often, the script fails immediately with
the raw AWS CLI error and tells you to re-authenticate the `torabarabim` profile before
trying again, rather than failing deep inside the AWS CLI with a stack trace.

**This is a live production database with no undo.** Decision
[0004](../docs/decisions/0004-deleting-cascades-deliberately.md) makes deleting a rabbi
or a place cascade to every lesson and exception that depends on it, in one transaction,
with no soft delete and no recycle bin. A wrong `DELETE` or `UPDATE` run by hand through
this tunnel is exactly as permanent as one run through the admin panel. The only recovery
is a database restore from the seven days of automated backup RDS keeps (see "What the
human does" step 2 above), which loses every change made since the backup. Treat every
query typed through this connection as if it cannot be undone, because it cannot.

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
