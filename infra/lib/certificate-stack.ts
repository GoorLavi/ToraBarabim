import { CfnOutput, CfnParameter, Stack, StackProps } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface CertificateStackProps extends StackProps {
  domain: string;
}

// CloudFront only accepts a certificate issued in us-east-1, regardless of
// which region the distribution and the rest of the site live in. This
// stack exists purely so that requirement has somewhere to live; its
// resources are consumed by SiteStack (eu-central-1) as plain deploy-time
// parameters (an ARN and a zone id), not as CDK cross-region construct
// references, so `cdk synth` never needs an AWS account to resolve.
export class CertificateStack extends Stack {
  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const { domain } = props;

    // torahbarabim.com is registered inside Route 53 directly, which
    // provisions its own hosted zone automatically as part of registration.
    // That zone is imported by id here, not created: creating a second zone
    // for the same domain name would produce different name servers than
    // the ones the domain registration already points at, and a domain
    // silently served by the wrong zone is a failure that takes hours to
    // notice. The id is supplied as a parameter rather than resolved with
    // `fromLookup`, which would call the real AWS account at synth time and
    // break `cdk synth` before any account exists.
    const hostedZoneId = new CfnParameter(this, 'HostedZoneId', {
      type: 'String',
      description: 'Hosted zone id Route 53 created automatically when the domain was registered',
    });
    const hostedZone = route53.PublicHostedZone.fromPublicHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: hostedZoneId.valueAsString,
      zoneName: domain,
    });

    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: domain,
      subjectAlternativeNames: [`www.${domain}`],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    new CfnOutput(this, 'CertificateArn', { value: certificate.certificateArn });
  }
}
