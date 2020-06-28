import * as awsx from '@pulumi/awsx';


// Create an ECS cluster explicitly, and give it a name tag.
const cluster = new awsx.ecs.Cluster('custom', {
  tags: {
    Name: 'node-ecs-cluster'
  }
});

const task = new awsx.ecs.FargateTaskDefinition('task', {
  containers: {
    nodeFrontend: {
      image: awsx.ecs.Image.fromPath('nodeFrontend', '')
    }
  }
});
