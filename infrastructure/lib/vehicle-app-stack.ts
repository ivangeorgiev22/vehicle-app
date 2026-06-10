import { Stack, StackProps, Duration, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import { ApiEndpoint, apiEndpoints } from './constants/core-endpoints';
import { entryApiEndpoints } from './constants/entry-endpoints';

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
    const imagesBucket = new s3.Bucket(this, `operator-images-bucket-${env}`, {
      bucketName: `operator-images-bucket-${env}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY
    });


    // API Gateway
    const restApi = new apigateway.RestApi(this, 'VehicleAppApi', {
      restApiName: `vehicle-app-${env}`,
      binaryMediaTypes: [
        'multipart/form-data',
        'image/jpeg',
        'image/png',
        'application/octet-stream'
      ],
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
    const coreResource = restApi.root.addResource('api');
    const coreIntegration = new apigateway.LambdaIntegration(coreApiLambda, { proxy: true });
    const entryIntegration = new apigateway.LambdaIntegration(entryApiLambda, { proxy: true });

    function generateRoutes(
      resource: apigateway.IResource, 
      endpoints: ApiEndpoint[], 
      integration: apigateway.LambdaIntegration) 
    {
      for (const endpoint of endpoints) {
        const childResource = resource.addResource(endpoint.endpointUrl);

        if(endpoint.httpMethods) {
          for (const method of endpoint.httpMethods) {
            childResource.addMethod(method, integration);
          }
        }

        if(endpoint.subEndpoints) {
          generateRoutes(childResource, endpoint.subEndpoints, integration);
        }
      }
    }
    generateRoutes(coreResource, apiEndpoints, coreIntegration);
    generateRoutes(restApi.root, entryApiEndpoints, entryIntegration);

    new CfnOutput(this, 'ApiUrl', {
      value: restApi.url,
      description: 'API Gateway URL'
    });
  }
}
