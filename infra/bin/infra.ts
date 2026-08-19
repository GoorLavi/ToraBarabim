import * as path from 'node:path';

import { App } from 'aws-cdk-lib';

import { CertificateStack } from '../lib/certificate-stack';
import { DatabaseStack } from '../lib/database-stack';
import { GitHubDeployRoleStack } from '../lib/github-deploy-role-stack';
import { NetworkStack } from '../lib/network-stack';
import { ServerStack } from '../lib/server-stack';
import { SiteStack } from '../lib/site-stack';

// Loads the repo root .env (gitignored) into process.env, the same file the
// server and client read. Missing is not an error here: the variables may
// already be exported in the shell, and the check below is what actually
// enforces they exist.
try {
  process.loadEnvFile(path.join(__dirname, '..', '..', '.env'));
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}

// The account this project deploys to is never hardcoded: it comes from the
// environment only, so it can never be committed. Pinning both `account` and
// `region` on every stack's `env` is what makes CDK's own env-specific-stack
// check refuse a deploy run under the wrong AWS profile, instead of silently
// building this stack in whatever account the default credentials point at.
const ACCOUNT = process.env.TORABARABIM_AWS_ACCOUNT;
const REGION = process.env.TORABARABIM_AWS_REGION;
if (!ACCOUNT || !REGION) {
  throw new Error(
    'Missing TORABARABIM_AWS_ACCOUNT and/or TORABARABIM_AWS_REGION. Set both in the ' +
      'repo root .env (see .env.example for the variable names) before running any ' +
      'cdk command. This is required so the CDK app can pin every stack to this ' +
      "project's own AWS account and refuse to run under a different one.",
  );
}

// CloudFront certificates must be requested in us-east-1 regardless of
// which region the rest of the app lives in. This is the one stack that
// does not use REGION above.
const CERTIFICATE_REGION = 'us-east-1';

const app = new App();

// Never hardcode a domain: it comes from CDK context, supplied with
// `-c domain=...` or in a (gitignored) cdk.context.json. It stays optional
// because the site went live without one and had the domain attached
// afterwards, which is the path any future domain change repeats.
const domainContext: unknown = app.node.tryGetContext('domain');
if (domainContext !== undefined && (typeof domainContext !== 'string' || domainContext.length === 0)) {
  throw new Error("CDK context value 'domain', if supplied, must be a non-empty string.");
}
const domain = domainContext as string | undefined;

const env = { account: ACCOUNT, region: REGION };

const network = new NetworkStack(app, 'TorabarabimNetwork', { env });
const database = new DatabaseStack(app, 'TorabarabimDatabase', {
  env,
  vpc: network.vpc,
  securityGroup: network.databaseSecurityGroup,
});
const server = new ServerStack(app, 'TorabarabimServer', {
  env,
  vpc: network.vpc,
  database: database.instance,
  serverSecurityGroup: network.serverSecurityGroup,
  vpcLinkSecurityGroup: network.vpcLinkSecurityGroup,
});

// No certificate stack at all without a domain: ACM has nothing to issue
// against, and CloudFront serves its own generated address on the default
// certificate instead. This keeps `cdk synth` from ever needing a hosted
// zone or a certificate ARN in no-domain mode.
if (domain) {
  new CertificateStack(app, 'TorabarabimCertificate', {
    env: { account: ACCOUNT, region: CERTIFICATE_REGION },
    domain,
  });
}
new SiteStack(app, 'TorabarabimSite', {
  env,
  domain,
  serverHttpApi: server.httpApi,
});

// Independent of every other stack: only reads TorabarabimServer's and
// TorabarabimSite's outputs at GitHub Actions runtime, never at synth or
// deploy time, so it has no CDK-level dependency on either. Deployed once,
// by hand, per infra/README.md; never touched by the automated pipeline it
// grants access to.
new GitHubDeployRoleStack(app, 'TorabarabimGitHubDeployRole', { env });
