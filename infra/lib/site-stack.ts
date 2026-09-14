import { CfnOutput, CfnParameter, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
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
  // Optional. torahbarabim.com is live, but the site shipped without it
  // first and must stay able to: without a domain this stack skips the
  // certificate, the hosted zone lookup, and the Route 53 records entirely,
  // and CloudFront serves on its own generated *.cloudfront.net address.
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

    // Framework mode emits no `index.html` at all: the document for every
    // path, including `/`, is rendered by the server on request. There is
    // therefore nothing left for a viewer-request CloudFront Function to
    // rewrite, and no `defaultRootObject` to set. The S3 origin below now
    // carries only hashed, named static files; every document goes to the
    // API origin instead (see `defaultBehavior`).
    const apiOriginDomain = `${serverHttpApi.apiId}.execute-api.${this.region}.amazonaws.com`;
    // Shared by every behavior that reaches the API: the document behaviors
    // below and `/v1/*` all talk to the same Fargate service through the
    // same HTTP API.
    const apiOrigin = new origins.HttpOrigin(apiOriginDomain, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
    });
    // Proxies Mixpanel analytics through this distribution's own domain
    // (behind `/mp/*` below) so an ad blocker that blocks `api-eu.mixpanel.com`
    // by hostname no longer catches the request.
    const mixpanelOrigin = new origins.HttpOrigin('api-eu.mixpanel.com', {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
    });
    // Everything except `Host`, which must stay CloudFront's own. API
    // Gateway matches the incoming `Host` against its execute-api domain
    // and answers anything else with a bare 403, so forwarding the
    // viewer's `Host` (what ALL_VIEWER does) breaks every request through
    // any of these behaviors while the API answers fine when called
    // directly. Shared by every behavior that must see the caller's
    // cookies and headers: `/v1/*` and the two session-backed document
    // paths, `/admin/*` and `/rabbi/*`.
    const sessionOriginRequestPolicy = cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER;
    const clientOrigin = origins.S3BucketOrigin.withOriginAccessControl(clientBucket);

    // `/health` is the container's own liveness probe (server/src/api/health),
    // answered by ECS over `localhost` inside the task and never through this
    // distribution today. It has no reason to be reachable publicly, and
    // leaving it reachable would put its response at the mercy of
    // `errorResponses` below: a real 503 from that endpoint would otherwise
    // become the outage page for anyone polling it from outside. A function
    // response is returned to the viewer before origin selection happens, so
    // it is answered without ever creating an origin response for
    // `errorResponses` to act on. See the comment on `errorResponses` for the
    // full reasoning.
    const blockHealthCheckFunction = new cloudfront.Function(this, 'BlockHealthCheckFunction', {
      code: cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          return { statusCode: 404, statusDescription: 'Not Found' };
        }
      `),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    // The `/mp/*` behavior below exists only so the viewer never sees the
    // `api-eu.mixpanel.com` hostname; the origin still expects its own path
    // shape (`/track`, `/engage`, and so on), so the `/mp` prefix that makes
    // the behavior routable has to come off again before the request leaves
    // the edge.
    const stripMixpanelPrefixFunction = new cloudfront.Function(this, 'StripMixpanelPrefixFunction', {
      code: cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          request.uri = request.uri.replace(/^\\/mp/, '');
          return request;
        }
      `),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });

    // A document response is public and cacheable, but it must never be
    // keyed or personalized on a cookie: the admin and rabbi-panel session
    // cookie would otherwise turn the first visitor's response into what
    // every later visitor on that edge location receives. Cookies are
    // dropped entirely, in both the cache key and what reaches the origin,
    // so a public loader that ever tried to read one would simply not see
    // it rather than silently poisoning the shared cache. The query string
    // *is* part of the cache key and is forwarded: the home page's filters
    // (city, date, search term) live there, and each combination is a
    // distinct page.
    const documentCachePolicy = new cloudfront.CachePolicy(this, 'DocumentCachePolicy', {
      comment: 'Public SSR documents: cacheable, keyed on the query string, never on a cookie',
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
      // 60 seconds by default absorbs a burst of crawler and visitor
      // traffic on the one small container this sits in front of (0010),
      // while still surfacing a newly entered lesson within a minute. A
      // route's own `Cache-Control`, once one is set, wins within this
      // min/max band; `minTtl: 0` lets an explicit no-store on a
      // session-sensitive response (if one is ever rendered on this path
      // by mistake) still take effect instead of being floored upward.
      minTtl: Duration.seconds(0),
      defaultTtl: Duration.seconds(60),
      maxTtl: Duration.days(1),
    });
    const documentOriginRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'DocumentOriginRequestPolicy', {
      comment: 'Public SSR documents: forwards the query string only, no cookies and no viewer headers',
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.none(),
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.none(),
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
    });

    // Used by the `/sitemap.xml` behavior below, which explains the TTL choice.
    const sitemapCachePolicy = new cloudfront.CachePolicy(this, 'SitemapCachePolicy', {
      comment: 'sitemap.xml: crawled occasionally, changes only when a rabbi, city or area is added',
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
      minTtl: Duration.seconds(0),
      defaultTtl: Duration.days(1),
      maxTtl: Duration.days(7),
    });

    // `domainNames` and `certificate` are left undefined without a domain:
    // CloudFront then serves the distribution on its own generated
    // *.cloudfront.net name using its default certificate, and needs
    // neither ACM nor Route 53 to be live. Both are plain (mutable)
    // `AWS::CloudFront::Distribution` properties, so adding them once the
    // domain exists is an in-place update to this same distribution, never
    // a replacement: the distribution id, its cache, and its DNS-visible
    // behavior for existing visitors carry over.
    //
    // Same distribution serves the document, the static client, and the API
    // on the same origin: the admin panel authenticates with a cookie, and
    // a separate API host turns that into a cross-site cookie problem for
    // no benefit.
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      domainNames: domain ? [domain, `www.${domain}`] : undefined,
      certificate,
      // Only meaningful alongside a custom certificate: CloudFront's own
      // default certificate has its security policy fixed at TLSv1 and
      // ignores this property, which CDK otherwise warns about on every
      // no-domain synth.
      minimumProtocolVersion: domain ? cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021 : undefined,
      // Every path not claimed by a more specific behavior below is a
      // document: the home page, a lesson, a rabbi, a city, `not-found`,
      // and the API's own 404 for a record that does not exist. All of it
      // is rendered by the server, so the default behavior is the API
      // origin, not the S3 bucket.
      defaultBehavior: {
        origin: apiOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: documentCachePolicy,
        originRequestPolicy: documentOriginRequestPolicy,
      },
      additionalBehaviors: {
        // The origin here is never actually reached: the function above
        // always returns its own response at viewer-request time, before
        // CloudFront picks an origin. It is still declared because the
        // behavior type requires one.
        '/health': {
          origin: apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          functionAssociations: [
            { function: blockHealthCheckFunction, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST },
          ],
        },
        // Same-origin path for Mixpanel calls (client/src analytics client
        // posts here instead of directly to api-eu.mixpanel.com). No cache:
        // every call is a distinct tracking event, not a cacheable resource.
        '/mp/*': {
          origin: mixpanelOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          functionAssociations: [
            { function: stripMixpanelPrefixFunction, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST },
          ],
        },
        '/v1/*': {
          origin: apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          // Caching off: an admin session cookie makes every response
          // specific to the caller, and a cached response here would be
          // served back to the next visitor regardless of who they are.
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: sessionOriginRequestPolicy,
        },
        // The admin and rabbi panel documents are server rendered too
        // (0023), but their loaders read the session cookie to decide
        // whether to redirect to the sign-in screen, so every response is
        // specific to the caller. Same shape as `/v1/*`: no caching, and
        // the cookie has to reach the origin for that check to work at all.
        '/admin/*': {
          origin: apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: sessionOriginRequestPolicy,
        },
        '/rabbi/*': {
          origin: apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: sessionOriginRequestPolicy,
        },
        // `sitemap.xml` is a resource route answered by the same Fargate
        // service (client/src/routes/sitemap.ts), not a static file, so it
        // needs an API origin behavior like the documents above rather than
        // the S3 behavior it used to have. Its content only changes when a
        // rabbi, a city or an area gains its first lesson, which a crawler
        // fetches occasionally and does not need same-minute freshness for,
        // so the edge TTL is a day rather than the document policy's
        // minute, keeping this cheap to serve (0010's cost ceiling) without
        // an extra request reaching the container for every crawl. The
        // route's own Cache-Control (client/src/routes/consts.ts's
        // `SITEMAP_CACHE_HEADERS`) matches this policy's default so local
        // development and the CDN agree.
        '/sitemap.xml': {
          origin: apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: sitemapCachePolicy,
          originRequestPolicy: documentOriginRequestPolicy,
        },
        // Hashed, content-addressed build output and the handful of named
        // static files the client build emits. All of it lives in the
        // private client bucket and none of it needs the container: this
        // is exactly the cost trade-off 0010 exists to protect (a document
        // request costs Fargate CPU it is not free to hand out; a static
        // file costs S3 and CloudFront, which this project already pays
        // for at this traffic).
        '/assets/*': {
          origin: clientOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        '/favicon.svg': {
          origin: clientOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        '/robots.txt': {
          origin: clientOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        // The outage fallback page (see `errorResponses` below). Also
        // reachable directly, which is the only way to eyeball it without
        // waiting for a real outage.
        '/outage.html': {
          origin: clientOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
      },
      // A server outage must never produce a white page (owner requirement,
      // 0023's second fallback). The mapping was originally 502/503/504,
      // reasoned from documented API Gateway behavior for an unreachable
      // integration (no running task, a stalled deploy, a timed-out
      // connection through the VPC Link). The owner tested that reasoning
      // against the live site by scaling the ECS service to zero, and the
      // browser showed a bare `{"message":"Internal Server Error"}`: API
      // Gateway's own **500** for an integration failure, not any of the
      // three that were mapped. None of them fired and the outage page never
      // appeared. 500 is now in the list, established by that test, not by
      // reading AWS's docs.
      //
      // It deliberately does NOT list 403 or 404: those are legitimate
      // responses this distribution already relies on (a missing rabbi is a
      // real 404 from the API, a missing S3 object is a real 403 from OAC),
      // and CloudFront's custom error responses apply distribution-wide by
      // status code with no way to scope them to one behavior, so folding
      // either into this page would rewrite that real 404 or 403 for every
      // visitor and crawler, not only during an actual outage.
      //
      // 500 cannot be excluded the same way, and that has a real cost: a
      // genuine application-level 500 from Fastify's own error handler on
      // `/v1/*` now also matches this mapping and is replaced by this same
      // static outage page, for the same distribution-wide-by-status-code
      // reason. A client fetch expecting a JSON error body gets this page's
      // HTML instead, fails to parse it, and falls into its own error state
      // regardless, so the visitor still sees an error either way, but the
      // `/v1/*` JSON contract is broken in that one case. This is accepted
      // knowingly, not missed: an origin group cannot fail over on a status
      // code within one behavior either, and a Lambda@Edge origin-response
      // function that could tell the two apart means a us-east-1 deployment
      // and a second runtime, rejected under 0010's cost ceiling for the same
      // reason it is rejected for the outage page mechanism itself, below.
      //
      // This fails open: told nothing else, a broken origin now answers with
      // a calm, readable, static "back soon" page instead of a raw gateway
      // error or a blank tab. The cost of that same distribution-wide reach is
      // symmetric, and it is no longer hypothetical: `GET /health`
      // (server/src/api/health) deliberately answers 503 while the SSR bundle
      // it renders through is broken, specifically so the ECS deployment
      // circuit breaker can detect and roll back a bad image. Reached through
      // this distribution, that 503 would be presented as this same outage
      // page instead of the JSON status a caller might expect, which is why
      // `/health` is not routed to the origin at all (see the
      // `blockHealthCheckFunction` behavior above): it answers a plain 404 at
      // the edge for any external caller, before this mapping, or the origin,
      // ever sees the request. The container's own probe is unaffected either
      // way, because it calls `http://localhost:<port>/health` directly
      // inside the task (ServerStack) and never goes through CloudFront; the
      // circuit breaker keeps working exactly as before. Anyone who needs to
      // watch this service's health from outside the container should use
      // ServerStack's `ServerErrorAlarm` and `NoHealthyTaskAlarm` (CloudWatch
      // plus SNS email), not a public request to `/health`, which no longer
      // answers at all. An origin-group failover to the S3 bucket was the
      // other candidate for the outage page itself and was rejected: a
      // CloudFront Function cannot rewrite the request only for the failover
      // case (it runs at viewer-request time, before origin selection
      // happens), and the bucket has no `index.html` or per-path fallback
      // object in framework mode, so a failed-over request would 404 against
      // S3 for almost every real path instead of showing anything useful.
      errorResponses: [500, 502, 503, 504].map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 503,
        responsePagePath: '/outage.html',
        ttl: Duration.seconds(30),
      })),
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
