// import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
// import * as awsx from '@pulumi/awsx';
export * from './res/web-static';


(async () => {
  const regions = aws.getRegion({});
  // tslint:disable-next-line: no-console
  console.log('[allRegions]', await (await regions).name);
})();

