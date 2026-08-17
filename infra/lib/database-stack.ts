import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

const DATABASE_NAME = 'torabarabim';
const DATABASE_USERNAME = 'torabarabim_app';
const BACKUP_RETENTION_DAYS = 7;

interface DatabaseStackProps extends StackProps {
  vpc: ec2.IVpc;
  securityGroup: ec2.SecurityGroup;
}

export class DatabaseStack extends Stack {
  public readonly instance: rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    this.instance = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_16 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE4_GRAVITON, ec2.InstanceSize.MICRO),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [props.securityGroup],
      credentials: rds.Credentials.fromGeneratedSecret(DATABASE_USERNAME),
      databaseName: DATABASE_NAME,
      allocatedStorage: 20,
      storageEncrypted: true,
      backupRetention: Duration.days(BACKUP_RETENTION_DAYS),
      deletionProtection: true,
      // The database survives stack deletion on purpose: decision 0004 makes
      // a wrong delete unrecoverable, and seven days of backup is the whole
      // recovery story beyond that.
      removalPolicy: RemovalPolicy.RETAIN,
      multiAz: false,
      publiclyAccessible: false,
    });
  }
}
