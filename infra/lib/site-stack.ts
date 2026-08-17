import { CfnOutput, CfnParameter, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface SiteStackProps extends StackProps {
  // Optional: the domain registration is stuck on an unresolved AWS support
  // case. Without a domain this stack skips the certificate, the hosted
  // zone lookup, and the Route 53 records entirely, and CloudFront serves
  // the site on its own generated *.cloudfront.net address instead.
  domain: string | undefined;
  serverHttpApi: apigwv2.HttpApi;
}

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    const { domain, serverHttpApi } = props;

    // Taken as an ARN parameter, not a construct reference: granting the
    // photo bucket to the role would attach a policy in ServerStack that
    // references this stack's bucket, and this stack already depends on
    // ServerStack for the API origin below. A dependency in both
    // directions is a cycle CloudFormation refuses to deploy.
    const serverTaskRoleArn = new CfnParameter(this, 'ServerTaskRoleArn', {
      type: 'String',
      description: 'ARN of the Fargate task role (TaskRoleArn output on TorabarabimServer)',
    });
    const serverTaskRole = iam.Role.fromRoleArn(this, 'ServerTaskRole', serverTaskRoleArn.valueAsString, {
      mutable: true,
    });

    // Without a domain there is nothing to validate a certificate against
    // and no hosted zone to write records into, so neither parameter is
    // declared at all: `cdk synth` in no-domain mode never references a
    // certificate or a hosted zone.
    let hostedZone: route53.IHostedZone | undefined;
    let certificate: acm.ICertificate | undefined;
    if (domain) {
      // The certificate and the hosted zone id are from CertificateStack
      // (us-east-1, required by CloudFront) and handed in here as plain
      // deploy-time values, the same way step one hands step-two-owned
      // values to ServerStack: a native CDK cross-region construct reference
      // would need an explicit AWS account at synth time, which does not
      // exist yet.
      const certificateArn = new CfnParameter(this, 'CertificateArn', {
        type: 'String',
        description: 'ACM certificate ARN (us-east-1) covering the domain and www, from CertificateStack',
      });
      const hostedZoneId = new CfnParameter(this, 'HostedZoneId', {
        type: 'String',
        description: 'Hosted zone id Route 53 created automatically when the domain was registered',
      });

      // Imported, not created: Route 53 already made this zone when the
      // domain was registered, and creating a second zone here would produce
      // different name servers than the ones the registration points at.
      hostedZone = route53.PublicHostedZone.fromPublicHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId: hostedZoneId.valueAsString,
        zoneName: domain,
      });
      certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', certificateArn.valueAsString);
    }

    // Private: the browser never talks to this bucket directly. CloudFront
    // reaches it through Origin Access Control, so a leaked or guessed
    // object key is still not publicly fetchable outside the distribution.
    const clientBucket = new s3.Bucket(this, 'ClientBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Public, matching decision 0005: the admin panel stores the bucket's
    // own URL on the lesson/rabbi row, and the browser fetches the photo
    // directly from it. RETAIN because a photo is uploaded content, not a
    // rebuildable artifact like the client bundle above.
    const photoBucket = new s3.Bucket(this, 'PhotoBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      publicReadAccess: true,
      // Public read comes from the bucket policy `publicReadAccess` adds
      // below, never from an object ACL, so ACLs stay blocked.
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS_ONLY,
      removalPolicy: RemovalPolicy.RETAIN,
    });
    // No long-lived access key: the Fargate task authenticates as itself.
    // See server/src/storage/client.ts and decision 0010's note to revisit
    // this once step two exists.
    photoBucket.grantReadWrite(serverTaskRole);

    // SPA routing without relying on CloudFront's distribution-wide custom
    // error pages: those trigger on a 403/404 from *any* origin, which
    // would rewrite a legitimate 404 from the API (e.g. a lesson that does
    // not exist) into a 200 serving index.html. Rewriting the request
    // before it reaches S3, only on the default (client) behavior, avoids
    // the collision entirely.
    const spaRoutingFunction = new cloudfront.Function(this, 'SpaRoutingFunction', {
      code: cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          if (!request.uri.includes('.')) {
            request.uri = '/index.html';
          }
          return request;
        }
      `),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    const apiOriginDomain = `${serverHttpApi.apiId}.execute-api.${this.region}.amazonaws.com`;

    // `domainNames` and `certificate` are left undefined without a domain:
    // CloudFront then serves the distribution on its own generated
    // *.cloudfront.net name using its default certificate, and needs
    // neither ACM nor Route 53 to be live. Both are plain (mutable)
    // `AWS::CloudFront::Distribution` properties, so adding them once the
    // domain exists is an in-place update to this same distribution, never
    // a replacement: the distribution id, its cache, and its DNS-visible
    // behavior for existing visitors carry over.
    //
    // Same distribution serves the static client and the API on the same
    // origin: the admin panel authenticates with a cookie, and a separate
    // API host turns that into a cross-site cookie problem for no benefit.
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      domainNames: domain ? [domain, `www.${domain}`] : undefined,
      certificate,
      // Only meaningful alongside a custom certificate: CloudFront's own
      // default certificate has its security policy fixed at TLSv1 and
      // ignores this property, which CDK otherwise warns about on every
      // no-domain synth.
      minimumProtocolVersion: domain ? cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021 : undefined,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(clientBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        functionAssociations: [
          { function: spaRoutingFunction, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST },
        ],
      },
      additionalBehaviors: {
        '/v1/*': {
          origin: new origins.HttpOrigin(apiOriginDomain, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          // Caching off: an admin session cookie makes every response
          // specific to the caller, and a cached response here would be
          // served back to the next visitor regardless of who they are.
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
      },
    });

    // No Route 53 records at all without a domain: nothing to alias to,
    // and no hosted zone to write into.
    if (domain && hostedZone) {
      for (const recordDomain of [domain, `www.${domain}`]) {
        new route53.ARecord(this, `${recordDomain}-a`.replace(/\./g, '-'), {
          zone: hostedZone,
          recordName: recordDomain,
          target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
        });
        new route53.AaaaRecord(this, `${recordDomain}-aaaa`.replace(/\./g, '-'), {
          zone: hostedZone,
          recordName: recordDomain,
          target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
        });
      }
    }

    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    // The address visitors actually use today. In no-domain mode this is
    // CloudFront's own generated name and is also the exact value the
    // server's CorsOrigins parameter must be redeployed with, since the
    // server otherwise has no way to know what origin the browser is
    // calling from.
    new CfnOutput(this, 'SiteUrl', {
      value: domain ? `https://${domain}` : `https://${distribution.domainName}`,
    });
    new CfnOutput(this, 'ClientBucketName', { value: clientBucket.bucketName });
    new CfnOutput(this, 'PhotoBucketName', { value: photoBucket.bucketName });
    // Exposed directly rather than through the distribution: routing
    // frequently-uploaded, individually-addressed photos through a CDN
    // behavior would need a cache-invalidation step added to every upload,
    // which decision 0005's key-derived-from-URL design never accounted
    // for. Direct-from-bucket keeps that upload path exactly as designed.
    new CfnOutput(this, 'PhotoBucketPublicBaseUrl', { value: `https://${photoBucket.bucketRegionalDomainName}` });
  }
}
