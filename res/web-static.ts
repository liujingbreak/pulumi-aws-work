import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

export function createS3() {
  const bucket = new aws.s3.Bucket('demoBucket', {
    acl: 'public-read',
    website: {
      indexDocument: 'index.html'
    }
  });
  return bucket;
}
