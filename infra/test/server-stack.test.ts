import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { NO_HEALTHY_TASK_THRESHOLD } from '../lib/consts';
import { DatabaseStack } from '../lib/database-stack';
import { NetworkStack } from '../lib/network-stack';
import { ServerStack } from '../lib/server-stack';

// No `env` is passed to any stack here: an environment-agnostic stack uses
// two dummy availability zones instead of an AWS context lookup, which is
// what lets this synthesize without credentials or a cdk.context.json.
const buildServerStackTemplate = (): Template => {
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
  return Template.fromStack(server);
};

describe('NoHealthyTaskAlarm', () => {
  test('only missing data can breach, never a real CPU datapoint', () => {
    const template = buildServerStackTemplate();

    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmDescription: 'The service has had no running task publishing metrics for 5 minutes',
      ComparisonOperator: 'GreaterThanThreshold',
      TreatMissingData: 'breaching',
      Threshold: NO_HEALTHY_TASK_THRESHOLD,
    });
  });
});

describe('Server container secrets', () => {
  test('TELEGRAM_CREDENTIALS comes from the SSM parameter, so the visitor-message alert cannot be switched off by a lost wiring', () => {
    const template = buildServerStackTemplate();

    const taskDefinitions = template.findResources('AWS::ECS::TaskDefinition');
    const serverContainer = Object.values(taskDefinitions)
      .flatMap((resource) => resource.Properties.ContainerDefinitions as Array<{ Name: string; Secrets?: Array<{ Name: string; ValueFrom: unknown }> }>)
      .find((container) => container.Name === 'Server');
    const secret = serverContainer?.Secrets?.find((candidate) => candidate.Name === 'TELEGRAM_CREDENTIALS');

    assert.ok(secret, 'expected the Server container to carry a TELEGRAM_CREDENTIALS secret');
    assert.match(JSON.stringify(secret.ValueFrom), /:ssm:.*:parameter/, 'expected TELEGRAM_CREDENTIALS to be sourced from an SSM parameter ARN');
  });
});
