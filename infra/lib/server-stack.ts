import * as path from 'node:path';

import { CfnOutput, CfnParameter, Duration, RemovalPolicy, SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cwActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

import { CONTAINER_PORT, DOCKER_BUILD_CONTEXT_EXCLUDES } from './consts';

const REPO_ROOT = path.join(__dirname, '..', '..');
const TASK_CPU = 256;
const TASK_MEMORY_MIB = 512;
const LOG_RETENTION = logs.RetentionDays.ONE_MONTH;

interface ServerStackProps extends StackProps {
  vpc: ec2.IVpc;
  database: rds.DatabaseInstance;
  serverSecurityGroup: ec2.SecurityGroup;
  vpcLinkSecurityGroup: ec2.SecurityGroup;
}

export class ServerStack extends Stack {
  // Exposed for SiteStack (step two) to route the CloudFront `/v1/*`
  // behavior at. The task role is deliberately not exposed as a construct:
  // granting the photo bucket to it from SiteStack would attach a policy
  // referencing the bucket's ARN onto a resource this stack owns, which
  // creates a dependency back onto SiteStack and a cycle with the one
  // below. Its ARN goes out as a plain CfnOutput instead (see TaskRoleArn),
  // for the human to pass into SiteStack as a parameter.
  public readonly httpApi: apigwv2.HttpApi;

  constructor(scope: Construct, id: string, props: ServerStackProps) {
    super(scope, id, props);

    const corsOrigins = new CfnParameter(this, 'CorsOrigins', {
      type: 'String',
      description: 'Comma-separated list of origins allowed to call the API',
    });
    const alertEmail = new CfnParameter(this, 'AlertEmail', {
      type: 'String',
      description: 'Email address that receives the 5xx and no-healthy-task alerts',
    });
    // A CfnParameter for the parameter's NAME, not its value: the value
    // (the Telegram bot token and chat id) is created out of band by the
    // human as an SSM SecureString, per infra/README.md, and never appears
    // here. The default keeps every existing deploy command working without
    // a new required argument.
    const telegramBotTokenParamName = new CfnParameter(this, 'TelegramBotTokenParamName', {
      type: 'String',
      default: '/torabarabim/telegram-bot-token',
      description:
        'SSM Parameter Store SecureString name holding {"botToken","chatId"} for the Telegram alert notifier',
    });
    // Step two owns the S3 bucket. These have no default on purpose: until
    // step two exists, the human must supply a placeholder, and the API
    // cannot actually serve images.
    const storageBucketName = new CfnParameter(this, 'StorageBucketName', {
      type: 'String',
      description: 'S3 bucket name for rabbi photos (created in step two)',
    });
    const storagePublicBaseUrl = new CfnParameter(this, 'StoragePublicBaseUrl', {
      type: 'String',
      description: 'Public base URL the browser uses to fetch uploaded images (from step two)',
    });

    const sessionSecret = new secretsmanager.Secret(this, 'SessionSecret', {
      description: 'Admin session cookie signing secret',
      generateSecretString: {
        secretStringTemplate: '{}',
        generateStringKey: 'value',
        excludePunctuation: true,
        passwordLength: 64,
      },
    });

    const databaseCredentials = props.database.secret;
    if (!databaseCredentials) {
      throw new Error('Database instance has no generated secret; check DatabaseStack credentials setup');
    }
    // The RDS-generated secret carries username/password/host/port/dbname as
    // separate JSON fields; the server wants one DATABASE_URL. The dynamic
    // reference resolves at deploy time, so the connection string is never
    // written as plaintext into the template. This is the AWS-documented way
    // to compose a JDBC-style URL from a generated RDS secret.
    //
    // sslmode=require is here because RDS enforces TLS by default
    // (rds.force_ssl) and refuses any plaintext connection outright. This
    // encrypts the connection but does not verify the server's certificate
    // against a certificate authority, so it stops passive eavesdropping,
    // not an active attacker already inside the VPC between the task and the
    // database. Verifying properly would mean sslmode=verify-full plus
    // shipping the RDS CA bundle in the image; not done here, only decided
    // against without asking, so flagging: worth it if that threat matters
    // more than the added image/cert-rotation upkeep.
    const databaseUrlSecret = new secretsmanager.Secret(this, 'DatabaseUrlSecret', {
      description: 'Full postgres:// connection string for the API server',
      secretObjectValue: {
        url: SecretValue.unsafePlainText(
          `postgres://${databaseCredentials.secretValueFromJson('username').unsafeUnwrap()}` +
            `:${databaseCredentials.secretValueFromJson('password').unsafeUnwrap()}` +
            `@${props.database.instanceEndpoint.hostname}:${props.database.instanceEndpoint.port}` +
            `/${databaseCredentials.secretValueFromJson('dbname').unsafeUnwrap()}` +
            `?sslmode=require`,
        ),
      },
    });

    const { serverSecurityGroup, vpcLinkSecurityGroup } = props;

    const namespace = new servicediscovery.PrivateDnsNamespace(this, 'Namespace', {
      name: 'torabarabim.internal',
      vpc: props.vpc,
    });

    const logGroup = new logs.LogGroup(this, 'ServerLogGroup', {
      retention: LOG_RETENTION,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpc,
      // ECS Exec (used once, by hand, to create the first admin user; see
      // README) sends its session transcript to the same log group as the
      // server, at the same one-month retention, instead of the default
      // AWS-managed and unbounded destination.
      executeCommandConfiguration: {
        logging: ecs.ExecuteCommandLogging.OVERRIDE,
        logConfiguration: { cloudWatchLogGroup: logGroup },
      },
    });

    const sharedEnvironment = {
      PORT: String(CONTAINER_PORT),
      HOST: '0.0.0.0',
      CORS_ORIGINS: corsOrigins.valueAsString,
      LOG_LEVEL: 'info',
      SESSION_TTL_HOURS: '168',
      STORAGE_REGION: this.region,
      STORAGE_BUCKET: storageBucketName.valueAsString,
      STORAGE_PUBLIC_BASE_URL: storagePublicBaseUrl.valueAsString,
      MAX_UPLOAD_BYTES: '5000000',
    };
    const sharedSecrets = {
      DATABASE_URL: ecs.Secret.fromSecretsManager(databaseUrlSecret, 'url'),
      SESSION_SECRET: ecs.Secret.fromSecretsManager(sessionSecret, 'value'),
    };

    const runtimeImage = ecs.ContainerImage.fromAsset(REPO_ROOT, {
      file: 'server/Dockerfile',
      target: 'runtime',
      platform: ecrAssets.Platform.LINUX_ARM64,
      exclude: DOCKER_BUILD_CONTEXT_EXCLUDES,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
      cpu: TASK_CPU,
      memoryLimitMiB: TASK_MEMORY_MIB,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });
    const serverContainer = taskDefinition.addContainer('Server', {
      image: runtimeImage,
      environment: sharedEnvironment,
      secrets: sharedSecrets,
      portMappings: [{ containerPort: CONTAINER_PORT }],
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'server', logGroup }),
      healthCheck: {
        command: [
          'CMD-SHELL',
          `node -e "require('http').get('http://localhost:${CONTAINER_PORT}/health',` +
            `r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"`,
        ],
        interval: Duration.seconds(30),
        timeout: Duration.seconds(5),
        retries: 3,
        startPeriod: Duration.seconds(30),
      },
    });

    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition,
      // Two tasks, not one: the owner tested the single-task shape by
      // scaling the service to zero, which is exactly what happens whenever
      // the one task dies on its own (a crash, a bad health check, an AZ
      // hiccup), and it took the whole site down. Two tasks at this size
      // cost roughly the same per month as one task at double the size
      // (0.25 vCPU x2 vs 0.5 vCPU x1), plus a second public IP (~3.60/month,
      // see the cost table in the README), so this buys the same CPU
      // headroom the larger single task would and removes the single point
      // of failure, for about the price of the public IP alone. It also
      // makes a deploy genuinely redundant rather than merely sequenced:
      // with `minHealthyPercent: 100` below, ECS now keeps two old tasks
      // serving traffic until two replacements pass their health check,
      // instead of the previous shape where the only "old" capacity during a
      // deploy was the single task being replaced. State that would break
      // under two tasks (an in-memory session, a sticky assumption) was
      // checked: admin sessions are rows in Postgres
      // (server/src/service/admin-auth/session.ts), read and written by
      // whichever task handles the request, so either task answers a session
      // check identically. Cloud Map's SRV record already supports more than
      // one registered instance, and API Gateway's service-discovery
      // integration resolves and balances across all of them; nothing here
      // was written assuming exactly one.
      desiredCount: 2,
      // No NAT gateway in this VPC: the task needs a public IP for outbound
      // internet to pull its image and reach Secrets Manager. Inbound is
      // still locked to the VPC Link security group only, so the public IP
      // is for egress, not for the internet reaching the app directly. Two
      // tasks now means two public IPs, priced accordingly in the README.
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      assignPublicIp: true,
      securityGroups: [serverSecurityGroup],
      // SRV, not A: with awsvpc networking ECS only publishes AWS_INSTANCE_PORT
      // on an SRV registration. An A record carries the task's address with no
      // port, and the API Gateway VPC Link integration then has nowhere to
      // route, which fails every request with a bare API Gateway 500 that
      // never reaches this container.
      //
      // The name changed from the original 'api' to 'api-srv' on purpose: a
      // Cloud Map service's record type cannot be changed in place while a
      // task is registered against it (ECS rejects the in-place update with
      // "does not require a value for 'containerPort'", confirmed against the
      // live account). Naming it differently forces CloudFormation to create
      // a new SRV-typed service and delete the old A-typed one, instead of
      // trying to mutate a resource that will not accept the change.
      cloudMapOptions: {
        cloudMapNamespace: namespace,
        name: 'api-srv',
        dnsRecordType: servicediscovery.DnsRecordType.SRV,
        container: serverContainer,
        containerPort: CONTAINER_PORT,
      },
      circuitBreaker: { rollback: true },
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      // Standing door into the running container, used once by hand to
      // create the first admin user (see README); the task role permissions
      // it needs are added automatically by this flag.
      enableExecuteCommand: true,
    });
    const cloudMapService = service.cloudMapService;
    if (!cloudMapService) {
      throw new Error('Fargate service did not register a Cloud Map service');
    }

    // No ALB: an idle ALB runs about $16/month regardless of traffic, while
    // this HTTP API costs about $1 per million requests, which at this
    // traffic is effectively free. The VPC Link is what lets it reach a
    // task that has no public listener.
    const vpcLink = new apigwv2.VpcLink(this, 'VpcLink', {
      vpc: props.vpc,
      subnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroups: [vpcLinkSecurityGroup],
    });
    const integration = new integrations.HttpServiceDiscoveryIntegration('Integration', cloudMapService, {
      vpcLink,
    });
    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      defaultIntegration: integration,
    });
    this.httpApi = httpApi;

    const alertTopic = new sns.Topic(this, 'AlertTopic', {
      displayName: 'ToraBarabim production alerts',
    });
    alertTopic.addSubscription(new snsSubscriptions.EmailSubscription(alertEmail.valueAsString));

    const alertNotifierLogGroup = new logs.LogGroup(this, 'AlertNotifierLogGroup', {
      retention: LOG_RETENTION,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const alertNotifierFunction = new lambdaNode.NodejsFunction(this, 'AlertNotifierFunction', {
      entry: path.join(__dirname, 'alert-notifier', 'handler.ts'),
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      timeout: Duration.seconds(10),
      logGroup: alertNotifierLogGroup,
      environment: {
        TELEGRAM_BOT_TOKEN_PARAM_NAME: telegramBotTokenParamName.valueAsString,
      },
      // Deliberately not given `vpc`: this account has no NAT Gateway (see
      // "Why no ALB, why no NAT gateway" in the README), so a VPC-attached
      // function here would have no route to api.telegram.org and every
      // send would fail silently by timing out, not by an error anyone
      // would notice quickly.
    });
    alertNotifierFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:${this.partition}:ssm:${this.region}:${this.account}:parameter${telegramBotTokenParamName.valueAsString}`,
        ],
      }),
    );
    // The parameter is a SecureString encrypted with the account's default
    // `aws/ssm` key, not a customer-managed one, so there is no key ARN of
    // our own to scope this to. AWS documents kms:Decrypt as one of the few
    // actions an IAM policy may target by key alias ARN, which keeps this to
    // exactly the one key rather than "*".
    const ssmDefaultKey = kms.Alias.fromAliasName(this, 'SsmDefaultKey', 'alias/aws/ssm');
    alertNotifierFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['kms:Decrypt'],
        resources: [ssmDefaultKey.keyArn],
      }),
    );
    alertTopic.addSubscription(new snsSubscriptions.LambdaSubscription(alertNotifierFunction));

    const serverErrorAlarm = new cloudwatch.Alarm(this, 'ServerErrorAlarm', {
      metric: httpApi.metricServerError({ period: Duration.minutes(5) }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'The API returned a 5xx response',
    });
    serverErrorAlarm.addAlarmAction(new cwActions.SnsAction(alertTopic));
    serverErrorAlarm.addOkAction(new cwActions.SnsAction(alertTopic));

    // CPUUtilization is only published while at least one task is running,
    // so missing data for five straight minutes is a reliable proxy for "no
    // healthy task" without turning on Container Insights, which bills per
    // metric on top of standard CloudWatch pricing.
    const noHealthyTaskAlarm = new cloudwatch.Alarm(this, 'NoHealthyTaskAlarm', {
      metric: service.metricCpuUtilization({ period: Duration.minutes(1) }),
      threshold: 100,
      evaluationPeriods: 5,
      datapointsToAlarm: 5,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
      alarmDescription: 'The service has had no running task publishing metrics for 5 minutes',
    });
    noHealthyTaskAlarm.addAlarmAction(new cwActions.SnsAction(alertTopic));
    noHealthyTaskAlarm.addOkAction(new cwActions.SnsAction(alertTopic));

    // A separate task definition the human runs by hand: never on container
    // start, never as part of a deploy. House rules forbid an agent running
    // a migration; the infrastructure must not do it either.
    const migrationImage = ecs.ContainerImage.fromAsset(REPO_ROOT, {
      file: 'server/Dockerfile',
      target: 'migrate',
      platform: ecrAssets.Platform.LINUX_ARM64,
      exclude: DOCKER_BUILD_CONTEXT_EXCLUDES,
    });
    const migrationTaskDefinition = new ecs.FargateTaskDefinition(this, 'MigrationTaskDefinition', {
      cpu: TASK_CPU,
      memoryLimitMiB: TASK_MEMORY_MIB,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });
    migrationTaskDefinition.addContainer('Migrate', {
      image: migrationImage,
      secrets: { DATABASE_URL: ecs.Secret.fromSecretsManager(databaseUrlSecret, 'url') },
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'migrate', logGroup }),
    });

    new CfnOutput(this, 'ApiUrl', { value: httpApi.apiEndpoint });
    new CfnOutput(this, 'ClusterName', { value: cluster.clusterName });
    new CfnOutput(this, 'ServiceName', { value: service.serviceName });
    new CfnOutput(this, 'MigrationTaskDefinitionArn', { value: migrationTaskDefinition.taskDefinitionArn });
    new CfnOutput(this, 'PublicSubnetIds', {
      value: props.vpc.publicSubnets.map((subnet) => subnet.subnetId).join(','),
    });
    new CfnOutput(this, 'ServerSecurityGroupId', { value: serverSecurityGroup.securityGroupId });
    new CfnOutput(this, 'TaskRoleArn', { value: taskDefinition.taskRole.roleArn });
  }
}
