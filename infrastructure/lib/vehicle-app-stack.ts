import { Stack, StackProps, Duration, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';

export class VehicleAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const env = process.env.ENVIRONMENT || 'dev';

    // DynamoDB tables
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: `users-${env}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });
    usersTable.addGlobalSecondaryIndex({
      indexName: 'username-index',
      partitionKey: { name: 'username', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });

    const missionsTable = new dynamodb.Table(this, 'MissionsTable', {
      tableName: `missions-${env}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const jobsTable = new dynamodb.Table(this, 'JobsTable', {
      tableName: `jobs-${env}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });
    jobsTable.addGlobalSecondaryIndex({
      indexName: 'mission-id-index',
      partitionKey: { name: 'mission_id', type: dynamodb.AttributeType.STRING }
    });

    // S3 bucket reference
    const imagesBucket = s3.Bucket.fromBucketName(this, 'ImagesBucket', `operator-images-bucket-${env}`);

    // API Gateway
    const restApi = new apigateway.RestApi(this, 'VehicleAppApi', {
      restApiName: `vehicle-app-${env}`,
      description: `Vehicle App ${env} API`,
      deployOptions: {
        stageName: env
      }
    });

    // Core Lambda
    const coreApiLambda = new lambda.Function(this, 'CoreApiLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'dist/lambda.lambdaHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../core-api')),
      timeout: Duration.seconds(30),
      memorySize: 256,
      environment: {
        NODE_ENV: env,
        S3_BUCKET_NAME: imagesBucket.bucketName,
        USERS_TABLE: usersTable.tableName,
        MISSIONS_TABLE: missionsTable.tableName,
        JOBS_TABLE: jobsTable.tableName
      }
    });

    usersTable.grantReadWriteData(coreApiLambda);
    missionsTable.grantReadWriteData(coreApiLambda);
    jobsTable.grantReadWriteData(coreApiLambda);
    imagesBucket.grantReadWrite(coreApiLambda);

    // Construct the API URL without referencing the deployment stage resource,
    // which would create a circular dependency (Lambda ← Stage ← Methods ← Lambda).
    const apiUrl = `https://${restApi.restApiId}.execute-api.${this.region}.amazonaws.com/${env}/`;

    // Entry Lambda
    const entryApiLambda = new lambda.Function(this, 'EntryApiLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'dist/lambda.lambdaHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../entry-api')),
      timeout: Duration.seconds(30),
      memorySize: 256,
      environment: {
        NODE_ENV: env,
        BASE_URL: apiUrl,
        JWT_SECRET: process.env.JWT_SECRET || ''
      }
    });

    // Routes
    const coreIntegration = new apigateway.LambdaIntegration(coreApiLambda, { proxy: true });
    const entryIntegration = new apigateway.LambdaIntegration(entryApiLambda, { proxy: true });

    // Core routes under /api/...
    const apiResource = restApi.root.addResource('api');

    const coreUsers = apiResource.addResource('users');
    coreUsers.addMethod('POST', coreIntegration);
    const coreUserValidate = coreUsers.addResource('validate');
    coreUserValidate.addMethod('POST', coreIntegration);
    const coreUser = coreUsers.addResource('{id}');
    const coreUserImage = coreUser.addResource('image');
    coreUserImage.addMethod('POST', coreIntegration);
    coreUserImage.addMethod('GET', coreIntegration);

    const coreMissions = apiResource.addResource('missions');
    coreMissions.addMethod('POST', coreIntegration);
    const coreMission = coreMissions.addResource('{id}');
    coreMission.addMethod('GET', coreIntegration);
    const coreMissionStatus = coreMission.addResource('status');
    coreMissionStatus.addMethod('PATCH', coreIntegration);

    const coreJobs = apiResource.addResource('jobs');
    coreJobs.addMethod('GET', coreIntegration);
    const coreJob = coreJobs.addResource('{id}');
    coreJob.addMethod('GET', coreIntegration);
    const coreJobStatus = coreJob.addResource('status');
    coreJobStatus.addMethod('PATCH', coreIntegration);
    const coreJobTask = coreJob.addResource('task');
    const coreJobTaskKey = coreJobTask.addResource('{key}');
    const coreJobTaskStatus = coreJobTaskKey.addResource('status');
    coreJobTaskStatus.addMethod('PATCH', coreIntegration);

    // Entry routes at root level
    const entryAuth = restApi.root.addResource('auth');
    const entryLogin = entryAuth.addResource('login');
    entryLogin.addMethod('POST', entryIntegration);

    const entryMissions = restApi.root.addResource('missions');
    entryMissions.addMethod('POST', entryIntegration);
    const entryMission = entryMissions.addResource('{id}');
    entryMission.addMethod('GET', entryIntegration);
    const entryMissionStatus = entryMission.addResource('status');
    entryMissionStatus.addMethod('PATCH', entryIntegration);

    const entryJobs = restApi.root.addResource('jobs');
    entryJobs.addMethod('GET', entryIntegration);
    const entryJob = entryJobs.addResource('{id}');
    entryJob.addMethod('GET', entryIntegration);
    const entryJobStatus = entryJob.addResource('status');
    entryJobStatus.addMethod('PATCH', entryIntegration);
    const entryJobTask = entryJob.addResource('task');
    const entryJobTaskKey = entryJobTask.addResource('{key}');
    const entryJobTaskStatus = entryJobTaskKey.addResource('status');
    entryJobTaskStatus.addMethod('PATCH', entryIntegration);

    const entryUsers = restApi.root.addResource('users');
    const entryUser = entryUsers.addResource('{id}');
    const entryUserImage = entryUser.addResource('image');
    entryUserImage.addMethod('POST', entryIntegration);
    entryUserImage.addMethod('GET', entryIntegration);

    new CfnOutput(this, 'ApiUrl', {
      value: restApi.url,
      description: 'API Gateway URL'
    });
  }
}
