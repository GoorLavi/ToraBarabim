import { Duration, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

// Mirrors the `origin` remote of this repository (see `git remote -v`): the
// only repository this role can ever be assumed from. Keep this in sync if
// the repository is ever renamed or transferred.
const GITHUB_REPOSITORY = 'GoorLavi/ToraBarabim';

// Must match the GitHub Environment name the human creates by hand (see
// infra/README.md) and the `environment:` key on the migration job in
// .github/workflows/deploy.yml. GitHub replaces the OIDC token's `sub` claim
// with this environment form only for a job that declares this environment,
// which is what lets the trust policy below tell a migration run apart from
// an ordinary push-to-main job.
const MIGRATION_ENVIRONMENT_NAME = 'production-migrations';

const SERVER_STACK_NAME = 'TorabarabimServer';
const SITE_STACK_NAME = 'TorabarabimSite';

// CDK's default bootstrap qualifier ("hnb659fds"). Every image asset built
// by `cdk deploy` (ServerStack's runtime and migrate Docker targets) lands
// in this one account/region-specific repository, tagged by content hash;
// confirmed against this account's own `cdk synth` output. If the account is
// ever re-bootstrapped with a custom `--qualifier`, this must be updated to
// match.
const CDK_BOOTSTRAP_QUALIFIER = 'hnb659fds';

export class GitHubDeployRoleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // One provider per account for this issuer URL: safe to create here
    // because nothing else in this account has registered GitHub's OIDC
    // provider yet, and a second registration for the same URL would fail.
    const provider = new iam.OpenIdConnectProvider(this, 'GitHubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    // Two GitHub-issued `sub` claim shapes are accepted, and nothing else:
    // - a workflow job running directly on a push to `main`
    //   (`repo:<org>/<repo>:ref:refs/heads/main`)
    // - a workflow job gated behind the `production-migrations` GitHub
    //   Environment, whose `sub` claim GitHub replaces with the environment
    //   form instead of the ref form
    //   (`repo:<org>/<repo>:environment:production-migrations`)
    // A pull request, any branch other than `main`, and any other
    // repository can never produce a token matching either string. No
    // access key is ever created for GitHub: this role is assumed only
    // through this federated identity, for the lifetime of one workflow run.
    const role = new iam.Role(this, 'GitHubDeployRole', {
      roleName: 'TorabarabimGitHubDeploy',
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        },
        StringLike: {
          'token.actions.githubusercontent.com:sub': [
            `repo:${GITHUB_REPOSITORY}:ref:refs/heads/main`,
            `repo:${GITHUB_REPOSITORY}:environment:${MIGRATION_ENVIRONMENT_NAME}`,
          ],
        },
      }),
      description:
        'Assumed by GitHub Actions on push to main to deploy the server image, run an approved migration, ' +
        'and deploy the client site. See infra/README.md.',
      maxSessionDuration: Duration.hours(1),
    });

    // Read only the two stacks this role's workflows ever touch, to resolve
    // names (cluster, service, bucket, distribution, API URL) from their
    // outputs at deploy time instead of hardcoding any of them.
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'ReadDeployStackOutputs',
        actions: ['cloudformation:DescribeStacks'],
        resources: [
          `arn:aws:cloudformation:${this.region}:${this.account}:stack/${SERVER_STACK_NAME}/*`,
          `arn:aws:cloudformation:${this.region}:${this.account}:stack/${SITE_STACK_NAME}/*`,
        ],
      }),
    );

    // Push the server's runtime and migrate images, built fresh from `main`,
    // into the exact same repository `cdk deploy` already uses for this
    // account's image assets. GetAuthorizationToken has no resource-level
    // permission in the ECR API and must stay "*"; every other action is
    // scoped to this one, exactly-named repository.
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'EcrAuth',
        actions: ['ecr:GetAuthorizationToken'],
        resources: ['*'],
      }),
    );
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'EcrPushServerImages',
        actions: [
          'ecr:BatchCheckLayerAvailability',
          'ecr:GetDownloadUrlForLayer',
          'ecr:BatchGetImage',
          'ecr:PutImage',
          'ecr:InitiateLayerUpload',
          'ecr:UploadLayerPart',
          'ecr:CompleteLayerUpload',
        ],
        resources: [
          `arn:aws:ecr:${this.region}:${this.account}:repository/` +
            `cdk-${CDK_BOOTSTRAP_QUALIFIER}-container-assets-${this.account}-${this.region}`,
        ],
      }),
    );

    // ECS: update the already-deployed service with a new task definition
    // revision, and run the already-deployed migration task definition with
    // a new revision of its own. DescribeTaskDefinition and
    // RegisterTaskDefinition support no resource-level permission at all in
    // the ECS API (AWS requires "*" for both, confirmed against the IAM
    // service authorization reference); this is not a scoping shortcut
    // taken here, it is the ceiling the API allows.
    //
    // The cluster, service, and task definition family are all left
    // unnamed in ServerStack, so CloudFormation assigns their physical
    // names at deploy time (confirmed: `cdk synth` emits no `ClusterName`,
    // `ServiceName`, or family on any of them). With no fixed name or
    // predictable prefix to scope to, and server-stack.ts out of this
    // role's ownership to change, DescribeServices, UpdateService, RunTask,
    // and DescribeTasks below are scoped to this account and region only,
    // not to the specific cluster or service. In practice this account runs
    // exactly one ECS cluster and one migration task definition family, but
    // that is an operational fact today, not something this policy
    // enforces. Giving those constructs fixed, predictable names in
    // ServerStack would let this narrow to the exact resource; flagged as a
    // follow-up rather than done here.
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'EcsDescribeAndRegister',
        actions: ['ecs:DescribeTaskDefinition', 'ecs:RegisterTaskDefinition'],
        resources: ['*'],
      }),
    );
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'EcsDeployAndMigrate',
        actions: ['ecs:DescribeServices', 'ecs:UpdateService', 'ecs:RunTask', 'ecs:DescribeTasks'],
        resources: [
          `arn:aws:ecs:${this.region}:${this.account}:cluster/*`,
          `arn:aws:ecs:${this.region}:${this.account}:service/*`,
          `arn:aws:ecs:${this.region}:${this.account}:task-definition/*`,
          `arn:aws:ecs:${this.region}:${this.account}:task/*`,
        ],
      }),
    );

    // PassRole is unavoidably broad here for the same reason: the task
    // definitions' execution and task roles are auto-generated by CDK with
    // no fixed, predictable ARN to name. The condition is the standard AWS-
    // recommended mitigation for exactly this situation: this role can pass
    // a role only to the ECS tasks service, never to anything else, so it
    // cannot be used to hand an arbitrary IAM role to a different AWS
    // service that would do something else with it.
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'PassEcsTaskRoles',
        actions: ['iam:PassRole'],
        resources: [`arn:aws:iam::${this.account}:role/*`],
        conditions: { StringEquals: { 'iam:PassedToService': 'ecs-tasks.amazonaws.com' } },
      }),
    );

    // S3: sync the built client onto the bucket SiteStack created. Same
    // limitation as the ECS resources above: the client bucket is unnamed
    // in SiteStack (confirmed: no `BucketName` in the synthesized
    // template), so CloudFormation assigns it a name only at deploy time,
    // with no predictable prefix to scope to from outside that stack. An S3
    // bucket ARN carries no account id, so a plain resource wildcard would
    // reach every bucket in every AWS account, not just this one; the
    // `s3:ResourceAccount` condition below is the documented way to pin an
    // S3 action back to buckets this account actually owns. Every action
    // here is read/write on object content only, never a bucket policy,
    // ACL, or other bucket-configuration change.
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'DeployClientToBucket',
        actions: ['s3:ListBucket', 's3:GetObject', 's3:PutObject', 's3:DeleteObject'],
        resources: [`arn:aws:s3:::*`, `arn:aws:s3:::*/*`],
        conditions: { StringEquals: { 's3:ResourceAccount': this.account } },
      }),
    );

    // CloudFront: invalidate the cache after a client deploy. Distribution
    // ids are random and not derived from the stack or construct name, so
    // there is no name-based pattern to scope this to at all, even in
    // principle. The action only clears cached responses; it cannot read or
    // change a distribution's configuration or origin.
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'InvalidateClientCache',
        actions: ['cloudfront:CreateInvalidation', 'cloudfront:GetInvalidation'],
        resources: ['*'],
      }),
    );

    new CfnOutput(this, 'RoleArn', { value: role.roleArn });
  }
}
