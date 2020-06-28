// tslint:disable: max-line-length
import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import fs from 'fs';
import Path from 'path';
import * as mime from 'mime';

const stackConfig = new pulumi.Config('my-project');
const bucketNamePrefix = 'demobucket';
const webContentsRootPath = Path.resolve(stackConfig.require('pathToWebsiteContents'));
const targetDomain = stackConfig.require('targetDomain');
const cloudfrontCfg = stackConfig.getObject<{cdnCacheMin: number}>('cloudfront');

const contentBucket = new aws.s3.Bucket(bucketNamePrefix, {
  acl: 'public-read',
  website: {
    indexDocument: 'index.html'
  }
});
export {contentBucket};
export const bucketName = contentBucket.id;
export const bucketWebsiteEndpoint = contentBucket.websiteEndpoint;

// tslint:disable-next-line: no-console
console.log('[web-static] Syncing contents from local disk at', webContentsRootPath);

crawlDirectory(webContentsRootPath, file => {
  // tslint:disable-next-line: no-console
  console.log('[web-static]', file);
  const relativeFilePath = Path.relative(webContentsRootPath, file).replace(/\\/g, '/');
  // tslint:disable-next-line: no-unused-expression
  new aws.s3.BucketObject(
      relativeFilePath,
    {
      key: relativeFilePath,

      acl: 'public-read',
      bucket: contentBucket,
      contentType: mime.getType(file) || undefined,
      source: new pulumi.asset.FileAsset(file)
    },
    {
      parent: contentBucket
    });
});

export const logsBucket = new aws.s3.Bucket('requestLogs', {
  bucket: `${targetDomain}-logs`,
  acl: 'private'
});

let cdn: aws.cloudfront.Distribution | undefined;
if (cloudfrontCfg) {
  const cdnCacheMin = 60 * cloudfrontCfg.cdnCacheMin;
  const distributionArgs: aws.cloudfront.DistributionArgs = {
    enabled: true,
    origins: [
      {
        originId: contentBucket.arn,
        domainName: contentBucket.websiteEndpoint,
        customOriginConfig: {
                  // Amazon S3 doesn't support HTTPS connections when using an S3 bucket configured as a website endpoint.
                  // tslint:disable-next-line: max-line-length
                  // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesOriginProtocolPolicy
          originProtocolPolicy: 'http-only',
          httpPort: 80,
          httpsPort: 443,
          originSslProtocols: ['TLSv1.2']
        }
      }
    ],
    restrictions: {
      geoRestriction: {
        restrictionType: 'none'
      }
    },

    viewerCertificate: {
      acmCertificateArn: createCertificate(cdnCacheMin),  // Per AWS, ACM certificate must be in the us-east-1 region.
      sslSupportMethod: 'sni-only'
    },
    defaultCacheBehavior: {
      targetOriginId: contentBucket.arn,

      viewerProtocolPolicy: 'allow-all',
      allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
      cachedMethods: ['GET', 'HEAD', 'OPTIONS'],

      forwardedValues: {
        cookies: { forward: 'none' },
        queryString: false
      },

      minTtl: 0,
      defaultTtl: cdnCacheMin,
      maxTtl: cdnCacheMin
    },
    loggingConfig: {
      bucket: logsBucket.bucketDomainName,
      includeCookies: false,
      prefix: `${targetDomain}/`
    }
  };

  cdn = new aws.cloudfront.Distribution('cdn', distributionArgs);
}

export {cdn};

function crawlDirectory(dir: string, onFile: (file: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = `${dir}/${file}`;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      crawlDirectory(filePath, onFile);
    }
    if (stat.isFile()) {
      onFile(filePath);
    }
  }
}
// Split a domain name into its subdomain and parent domain names.
// e.g. "www.example.com" => "www", "example.com".
function getDomainAndSubdomain(domain: string):
{ subdomain: string, parentDomain: string } {
  const parts = domain.split('.');
  if (parts.length < 2) {
    throw new Error(`No TLD found on ${domain}`);
  }
    // No subdomain, e.g. awesome-website.com.
  if (parts.length === 2) {
    return { subdomain: '', parentDomain: domain };
  }

  const subdomain = parts[0];
  parts.shift();  // Drop first element.
  return {
    subdomain,
        // Trailing "." to canonicalize domain.
    parentDomain: parts.join('.') + '.'
  };
}

function createCertificate(cdnCacheMin: number) {
  const eastRegion = new aws.Provider('east', {
    profile: aws.config.profile,
    region: 'us-east-1' // Per AWS, ACM certificate must be in the us-east-1 region.
  });

  const certificate = new aws.acm.Certificate('certificate', {
    domainName: targetDomain,
    validationMethod: 'DNS'
  }, { provider: eastRegion });

  const domainParts = getDomainAndSubdomain(targetDomain);
  const hostedZoneId = aws.route53.getZone({ name: domainParts.parentDomain }, { async: true }).then(zone => zone.zoneId);

    /**
     *  Create a DNS record to prove that we _own_ the domain we're requesting a certificate for.
     *  See https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-validate-dns.html for more info.
     */
  const certificateValidationDomain = new aws.route53.Record(`${targetDomain}-validation`, {
    name: certificate.domainValidationOptions[0].resourceRecordName,
    zoneId: hostedZoneId,
    type: certificate.domainValidationOptions[0].resourceRecordType,
    records: [certificate.domainValidationOptions[0].resourceRecordValue],
    ttl: cdnCacheMin
  });

    /**
     * This is a _special_ resource that waits for ACM to complete validation via the DNS record
     * checking for a status of "ISSUED" on the certificate itself. No actual resources are
     * created (or updated or deleted).
     *
     * See https://www.terraform.io/docs/providers/aws/r/acm_certificate_validation.html for slightly more detail
     * and https://github.com/terraform-providers/terraform-provider-aws/blob/master/aws/resource_aws_acm_certificate_validation.go
     * for the actual implementation.
     */
  const certificateValidation = new aws.acm.CertificateValidation('certificateValidation', {
    certificateArn: certificate.arn,
    validationRecordFqdns: [certificateValidationDomain.fqdn]
  }, { provider: eastRegion });

  return certificateValidation.certificateArn;
}

