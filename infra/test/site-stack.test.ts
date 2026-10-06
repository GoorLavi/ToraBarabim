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

describe('the lesson calendar behaviors', () => {
  const CALENDAR_PATH_PATTERNS = ['/lesson/*/calendar.ics', '/lesson/*/*/event.ics'];

  // The behavior points at a cache policy by a logical id, so the policy's
  // own properties are read through that reference instead of by name.
  test('both calendar paths have a behavior on the calendar cache policy, with the query string out of the key', () => {
    const template = buildSiteStackTemplate();

    const calendarPolicies = template.findResources('AWS::CloudFront::CachePolicy', {
      Properties: {
        CachePolicyConfig: {
          DefaultTTL: 3600,
          MinTTL: 0,
          MaxTTL: 86400,
          ParametersInCacheKeyAndForwardedToOrigin: {
            QueryStringsConfig: { QueryStringBehavior: 'none' },
            CookiesConfig: { CookieBehavior: 'none' },
            HeadersConfig: { HeaderBehavior: 'none' },
          },
        },
      },
    });
    const calendarPolicyIds = Object.keys(calendarPolicies);
    assert.equal(calendarPolicyIds.length, 1, 'expected exactly one cache policy shaped like the calendar one');

    const [distribution] = Object.values(template.findResources('AWS::CloudFront::Distribution'));
    const behaviors = distribution?.Properties.DistributionConfig.CacheBehaviors as Array<{
      PathPattern: string;
      CachePolicyId: { Ref: string };
      ViewerProtocolPolicy: string;
    }>;

    for (const pathPattern of CALENDAR_PATH_PATTERNS) {
      const behavior = behaviors.find((candidate) => candidate.PathPattern === pathPattern);
      assert.ok(behavior, `expected a behavior for ${pathPattern}`);
      assert.deepEqual(behavior.CachePolicyId, { Ref: calendarPolicyIds[0] }, `expected ${pathPattern} to use the calendar cache policy`);
      assert.equal(behavior.ViewerProtocolPolicy, 'redirect-to-https');
    }
  });

  test('the calendar behaviors forward nothing from the viewer to the origin', () => {
    const template = buildSiteStackTemplate();

    const forwardNothingPolicies = template.findResources('AWS::CloudFront::OriginRequestPolicy', {
      Properties: {
        OriginRequestPolicyConfig: {
          CookiesConfig: { CookieBehavior: 'none' },
          HeadersConfig: { HeaderBehavior: 'none' },
          QueryStringsConfig: { QueryStringBehavior: 'none' },
        },
      },
    });
    const forwardNothingIds = Object.keys(forwardNothingPolicies);
    assert.equal(forwardNothingIds.length, 1, 'expected exactly one origin request policy that forwards nothing');

    const [distribution] = Object.values(template.findResources('AWS::CloudFront::Distribution'));
    const behaviors = distribution?.Properties.DistributionConfig.CacheBehaviors as Array<{
      PathPattern: string;
      OriginRequestPolicyId: { Ref: string };
    }>;

    for (const pathPattern of CALENDAR_PATH_PATTERNS) {
      const behavior = behaviors.find((candidate) => candidate.PathPattern === pathPattern);
      assert.ok(behavior, `expected a behavior for ${pathPattern}`);
      assert.deepEqual(behavior.OriginRequestPolicyId, { Ref: forwardNothingIds[0] });
    }
  });
});
