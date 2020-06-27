import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import {createS3} from './res/web-static';


(async () => {
  const regions = aws.getRegion({});
  // tslint:disable-next-line: no-console
  console.log('[allRegions]', await (await regions).name);
})();

// Create an AWS resource (S3 Bucket)
export const bucket = createS3();
// Export the name of the bucket
export const bucketName = bucket.id;
