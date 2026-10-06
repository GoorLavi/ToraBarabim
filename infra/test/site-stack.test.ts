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

// The id AWS publishes for its managed CACHING_OPTIMIZED policy: a day by
// default and up to a year, which is right for hashed files and wrong for the
// two named files a browser must hear about quickly.
const CACHING_OPTIMIZED_POLICY_ID = '658327ea-f89d-4fab-a63d-7e88639e58f6';

// The longest the edge may hold sw.js or the manifest. A literal here, not the
// constant the stack reads, so raising the constant fails this test.
const LONGEST_ACCEPTABLE_WORKER_EDGE_TTL_SECONDS = 60;

interface SynthesizedBehavior {
  PathPattern: string;
  TargetOriginId: string;
  CachePolicyId: string | { Ref: string };
}

interface SynthesizedOrigin {
  Id: string;
  DomainName: unknown;
}

describe('the service worker, the manifest, and the icons at the edge', () => {
  const synthesize = () => {
    const template = buildSiteStackTemplate();
    const json = template.toJSON() as { Resources: Record<string, { Type: string; Properties: Record<string, unknown> }> };
    const distribution = Object.values(json.Resources).find((resource) => resource.Type === 'AWS::CloudFront::Distribution');
    assert.ok(distribution, 'expected the site stack to define a distribution');
    const config = distribution.Properties['DistributionConfig'] as { CacheBehaviors: SynthesizedBehavior[]; Origins: SynthesizedOrigin[] };
    return { json, behaviors: config.CacheBehaviors, origins: config.Origins };
  };

  const findBehavior = (behaviors: SynthesizedBehavior[], pathPattern: string): SynthesizedBehavior => {
    const behavior = behaviors.find((candidate) => candidate.PathPattern === pathPattern);
    assert.ok(behavior, `expected a cache behavior for ${pathPattern}`);
    return behavior;
  };

  // The client bucket's origin is the only one whose domain is the bucket's
  // own regional name; the API origin's domain is an execute-api address.
  const assertServedFromTheClientBucket = (behavior: SynthesizedBehavior, origins: SynthesizedOrigin[]): void => {
    const origin = origins.find((candidate) => candidate.Id === behavior.TargetOriginId);
    assert.ok(origin, `expected ${behavior.PathPattern} to name an origin that exists`);
    assert.match(JSON.stringify(origin.DomainName), /ClientBucket[A-F0-9]+.*RegionalDomainName/, `expected ${behavior.PathPattern} to be served from the client bucket`);
  };

  for (const pathPattern of ['/sw.js', '/manifest.webmanifest']) {
    test(`${pathPattern} is served from the client bucket by a policy that caches for at most a minute`, () => {
      const { json, behaviors, origins } = synthesize();
      const behavior = findBehavior(behaviors, pathPattern);

      assertServedFromTheClientBucket(behavior, origins);
      assert.notEqual(behavior.CachePolicyId, CACHING_OPTIMIZED_POLICY_ID, `${pathPattern} must not use CACHING_OPTIMIZED`);
      assert.ok(typeof behavior.CachePolicyId === 'object', `expected ${pathPattern} to reference a policy this stack defines`);

      const policy = json.Resources[behavior.CachePolicyId.Ref];
      assert.ok(policy, `expected the policy ${behavior.CachePolicyId.Ref} to exist`);
      const policyConfig = policy.Properties['CachePolicyConfig'] as { MinTTL: number; DefaultTTL: number; MaxTTL: number };
      assert.ok(
        policyConfig.MaxTTL <= LONGEST_ACCEPTABLE_WORKER_EDGE_TTL_SECONDS,
        `expected MaxTTL of at most ${LONGEST_ACCEPTABLE_WORKER_EDGE_TTL_SECONDS} seconds for ${pathPattern}, got ${policyConfig.MaxTTL}`,
      );
    });
  }

  test('/pwa/* is served from the client bucket, not the container', () => {
    const { behaviors, origins } = synthesize();
    assertServedFromTheClientBucket(findBehavior(behaviors, '/pwa/*'), origins);
  });
});
