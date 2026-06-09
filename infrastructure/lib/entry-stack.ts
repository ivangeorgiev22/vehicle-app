import {Stack, StackProps, Duration} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

interface EntryStackProps extends StackProps {
  api: apigateway.RestApi;
  coreApiUrl: string;
}

export class EntryStack extends Stack {
  constructor(scope: Construct, id: string, props: EntryStackProps) {
    super(scope, id, props);

    const entryApiLambda = new lambda.Function(this, 'EntryApiLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'dist/lambda.lambdaHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../entry-api')),
      timeout: Duration.seconds(30),
      memorySize: 256,
      environment: {
        NODE_ENV: 'stage',
        BASE_URL: props.coreApiUrl,
        JWT_SECRET: process.env.JWT_SECRET || ''
      }
    });

    const entryApiIntegration = new apigateway.LambdaIntegration(entryApiLambda, {proxy: true});

    //auth
    const entryAuth = props.api.root.addResource('auth');
    const entryLogin = entryAuth.addResource('login');
    entryLogin.addMethod('POST', entryApiIntegration);

    //missions
    const entryMissions = props.api.root.addResource('missions');
    entryMissions.addMethod('POST', entryApiIntegration);
    const entryMission = entryMissions.addResource('{id}');
    entryMission.addMethod('GET', entryApiIntegration);
    const entryMissionStatus = entryMission.addResource('status');
    entryMissionStatus.addMethod('PATCH', entryApiIntegration);

    //jobs
    const entryJobs = props.api.root.addResource('jobs');
    entryJobs.addMethod('GET', entryApiIntegration);
    const entryJob = entryJobs.addResource('{id}');
    entryJob.addMethod('GET', entryApiIntegration);
    const entryJobStatus = entryJob.addResource('status');
    entryJobStatus.addMethod('PATCH', entryApiIntegration);
    const entryJobTask = entryJob.addResource('task');
    const entryJobTaskKey = entryJobTask.addResource('{key}');
    const entryJobTaskStatus = entryJobTaskKey.addResource('status');
    entryJobTaskStatus.addMethod('PATCH', entryApiIntegration);

    //users
    const entryUsers = props.api.root.addResource('users');
    const entryUser = entryUsers.addResource('{id}');
    const entryUserImage = entryUser.addResource('image');
    entryUserImage.addMethod('POST', entryApiIntegration);
    entryUserImage.addMethod('GET', entryApiIntegration);
  };
}
