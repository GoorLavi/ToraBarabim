import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

import { CONTAINER_PORT } from './consts';

export class NetworkStack extends Stack {
  public readonly vpc: ec2.Vpc;
  public readonly databaseSecurityGroup: ec2.SecurityGroup;
  public readonly serverSecurityGroup: ec2.SecurityGroup;
  public readonly vpcLinkSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // No NAT gateway: it costs more per month than the rest of this stack
    // combined. The server task gets a public IP for outbound internet
    // instead (see ServerStack), and the database sits in isolated subnets
    // with no route out at all.
    this.vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: 'isolated', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
      ],
    });

    // The three security groups below reference one another, so they are
    // defined together in this foundational stack. Splitting them across
    // DatabaseStack and ServerStack would make each stack depend on the
    // other for its own security group rules, a cycle CloudFormation
    // refuses to deploy.
    this.databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: this.vpc,
      description: 'RDS Postgres for ToraBarabim, reachable only from the API server',
      allowAllOutbound: false,
    });
    this.serverSecurityGroup = new ec2.SecurityGroup(this, 'ServerSecurityGroup', {
      vpc: this.vpc,
      description: 'ToraBarabim API server task',
      allowAllOutbound: true,
    });
    this.vpcLinkSecurityGroup = new ec2.SecurityGroup(this, 'VpcLinkSecurityGroup', {
      vpc: this.vpc,
      description: 'API Gateway VPC Link reaching the API server task',
      allowAllOutbound: true,
    });

    this.databaseSecurityGroup.addIngressRule(
      this.serverSecurityGroup,
      ec2.Port.tcp(5432),
      'API server only',
    );
    this.serverSecurityGroup.addIngressRule(
      this.vpcLinkSecurityGroup,
      ec2.Port.tcp(CONTAINER_PORT),
      'API Gateway VPC Link only',
    );
  }
}
