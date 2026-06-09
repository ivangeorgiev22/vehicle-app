import {Stack, StackProps, Duration, CfnOutput, RemovalPolicy} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class CoreStack extends Stack {
  public readonly coreApiUrl: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope,id,props);

    //dynamoDB tables definitions
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'users',
      partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY //delete tables when stack is destroyed
    });
    //GSI for username lookup
    usersTable.addGlobalSecondaryIndex({
      indexName: 'username-index',
      partitionKey: {name: 'username', type: dynamodb.AttributeType.STRING},
      projectionType: dynamodb.ProjectionType.ALL
    });
    
    const missionsTable = new dynamodb.Table(this, 'MissionsTable', {
      tableName: 'missions',
      partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });
    
    const jobsTable = new dynamodb.Table(this, 'JobsTable', {
      tableName: 'jobs',
      partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });
    
    //GSI for querying jobs by missions
    jobsTable.addGlobalSecondaryIndex({
      indexName: 'mission-id-index',
      partitionKey: {name: 'mission_id', type: dynamodb.AttributeType.STRING}
    });
    
    //bucket reference
    const imagesBucket = s3.Bucket.fromBucketName(this, 'ImagesBucket', 'operator-images-bucket-dev');
    
    const coreApiLambda = new lambda.Function(this, 'CoreApiLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'dist/lambda.lambdaHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../core-api')),
      timeout: Duration.seconds(30),
      memorySize: 256,
      environment: {
        NODE_ENV: 'stage',
        S3_BUCKET_NAME: imagesBucket.bucketName,
        USERS_TABLE: usersTable.tableName,
        MISSIONS_TABLE: missionsTable.tableName,
        JOBS_TABLE: jobsTable.tableName
      }
    });

    //API Gateway for request routing
    const api = new apigateway.RestApi(this, 'CoreVehicleAppApi', {
      restApiName: 'core-vehicle-app-stage',
      description: 'Core Vehicle App Stage API',
    });
    
    const coreApiIntegration = new apigateway.LambdaIntegration(coreApiLambda, {proxy: true});
    const apiResource = api.root.addResource('api');
    
    //users
    const coreUsers = apiResource.addResource('users');
    coreUsers.addMethod('POST', coreApiIntegration);
    const coreUserValidate = coreUsers.addResource('validate');
    coreUserValidate.addMethod('POST', coreApiIntegration);
    const coreUser = coreUsers.addResource('{id}');
    const coreUserImage = coreUser.addResource('image');
    coreUserImage.addMethod('POST', coreApiIntegration);
    coreUserImage.addMethod('GET', coreApiIntegration);
    
    //missions
    const coreMissions = apiResource.addResource('missions');
    coreMissions.addMethod('POST', coreApiIntegration);
    const coreMission = coreMissions.addResource('{id}');
    coreMission.addMethod('GET', coreApiIntegration);
    const coreMissionStatus = coreMission.addResource('status');
    coreMissionStatus.addMethod('PATCH', coreApiIntegration);
    
    //jobs
    const coreJobs = apiResource.addResource('jobs');
    coreJobs.addMethod('GET', coreApiIntegration);
    const coreJob = coreJobs.addResource('{id}');
    coreJob.addMethod('GET', coreApiIntegration);
    const coreJobStatus = coreJob.addResource('status');
    coreJobStatus.addMethod('PATCH', coreApiIntegration);
    const coreJobTask = coreJob.addResource('task');
    const coreJobTaskKey = coreJobTask.addResource('{key}');
    const coreJobTaskStatus = coreJobTaskKey.addResource('status');
    coreJobTaskStatus.addMethod('PATCH', coreApiIntegration);
    
    // export api url for entry stack
    this.coreApiUrl = api.url;

    //grant lambda permission to access tables
    usersTable.grantReadWriteData(coreApiLambda);
    missionsTable.grantReadWriteData(coreApiLambda);
    jobsTable.grantReadWriteData(coreApiLambda);
    imagesBucket.grantReadWrite(coreApiLambda);

    new CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });
  }
}