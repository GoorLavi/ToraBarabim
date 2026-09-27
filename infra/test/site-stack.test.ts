import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { BLOCKED_VIEWER_COUNTRIES } from '../lib/consts';
import { DatabaseStack } from '../lib/database-stack';
import { NetworkStack } from '../lib/network-stack';
import { ServerStack } from '../lib/server-stack';
import { SiteStack } from '../lib/site-stack';

// No `env` and no domain: the same environment-agnostic shape as
// server-stack.test.ts, which is what lets SiteStack synthesize without a
// hosted zone lookup, a certificate, or credentials.
const buildSiteStackTemplate = (): Template => {
  const app = new App();
  const network = new NetworkStack(app, 'TestNetwork');
  const database = new DatabaseStack(app, 'TestDatabase', {
    vpc: network.vpc,
    securityGroup: network.databaseSecurityGroup,
  });
  const server = new ServerStack(app, 'TestServer', {
    vpc: network.vpc,
    database: database.instance,
    serverSecurityGroup: network.serverSecurityGroup,
    vpcLinkSecurityGroup: network.vpcLinkSecurityGroup,
  });
  const site = new SiteStack(app, 'TestSite', { domain: undefined, serverHttpApi: server.httpApi });
  return Template.fromStack(site);
};

describe('the distribution geographic restriction', () => {
  test('is a denylist of exactly the blocked countries', () => {
    const template = buildSiteStackTemplate();

    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        Restrictions: {
          GeoRestriction: { RestrictionType: 'blacklist', Locations: BLOCKED_VIEWER_COUNTRIES },
        },
      },
    });
  });

  test('never names the United States or Israel', () => {
    assert.ok(!BLOCKED_VIEWER_COUNTRIES.includes('US'), 'US must never be blocked at the edge');
    assert.ok(!BLOCKED_VIEWER_COUNTRIES.includes('IL'), 'IL must never be blocked at the edge');
  });
});
