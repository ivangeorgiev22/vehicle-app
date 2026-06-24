import { Stack, StackProps, Duration, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import { ApiEndpoint, apiEndpoints } from './constants/core-endpoints';
import { entryApiEndpoints } from './constants/entry-endpoints';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwv2integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as logs from 'aws-cdk-lib/aws-logs';

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

    const connectionsTable = new dynamodb.Table(this, 'ConnectionsTable', {
      tableName: `connections-${env}`,
      partitionKey: {name: 'connectionId', type: dynamodb.AttributeType.STRING},
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });

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

    // Construct the API URL without referencing the deployment stage resource,
    // which would create a circular dependency (Lambda ← Stage ← Methods ← Lambda).
    const apiUrl = `https://${restApi.restApiId}.execute-api.${this.region}.amazonaws.com/${env}/`;


    const webSocketApi = new apigwv2.WebSocketApi(this, 'VehicleAppWebSocket', {
      apiName: `vehicle-app-websocket-${env}`
    });
    const webSocketStage = new apigwv2.WebSocketStage(this, 'VehicleAppWebSocketStage', {
      webSocketApi,
      stageName: env,
      autoDeploy: true
    });

    const webSocketLogGroup = new logs.LogGroup(this, 'WebSocketLogGroup', {
      logGroupName: `websocket-lambda-logs-${env}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const webSocketUrl = `https://${webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com/${env}`;

    const webSocketLambda = new lambda.Function(this, 'WebSocketLambda', {
      functionName: `websocket-lambda-${env}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'dist/websocket-lambda.webSocketHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../entry-api')),
      timeout: Duration.seconds(30),
      memorySize: 256,
      logGroup: webSocketLogGroup,
      environment: {
        NODE_ENV: env,
        CONNECTIONS_TABLE: connectionsTable.tableName,
        JOBS_TABLE: jobsTable.tableName,
        WEBSOCKET_ENDPOINT: webSocketUrl,
        BASE_URL: apiUrl,
        JWT_SECRET: process.env.JWT_SECRET || '',

      }
    });

    const coreApiLogGroup = new logs.LogGroup(this, 'CoreApiLambdaLogGroup', {
      logGroupName: `core-api-lambda-logs-${env}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY
    });

    // Core Lambda
    const coreApiLambda = new lambda.Function(this, 'CoreApiLambda', {
      functionName: `core-api-lambda-${env}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'dist/lambda.lambdaHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../core-api')),
      timeout: Duration.seconds(30),
      memorySize: 256,
      logGroup: coreApiLogGroup,
      environment: {
        NODE_ENV: env,
        S3_BUCKET_NAME: imagesBucket.bucketName,
        USERS_TABLE: usersTable.tableName,
        MISSIONS_TABLE: missionsTable.tableName,
        JOBS_TABLE: jobsTable.tableName,
        SENDER_EMAIL: process.env.SENDER_EMAIL || '',
      }
    });

    usersTable.grantReadWriteData(coreApiLambda);
    missionsTable.grantReadWriteData(coreApiLambda);
    jobsTable.grantReadWriteData(coreApiLambda);
    imagesBucket.grantReadWrite(coreApiLambda);
    coreApiLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail'],
      resources: ['*']
    }));

    const entryApiLogGroup = new logs.LogGroup(this, 'EntryApiLogGroup', {
      logGroupName: `entry-api-lambda-logs-${env}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY
    });

    // Entry Lambda
    const entryApiLambda = new lambda.Function(this, 'EntryApiLambda', {
      functionName: `entry-api-lambda-${env}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'dist/lambda.lambdaHandler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../entry-api')),
      timeout: Duration.seconds(30),
      memorySize: 256,
      logGroup: entryApiLogGroup,
      environment: {
        NODE_ENV: env,
        BASE_URL: apiUrl,
        JWT_SECRET: process.env.JWT_SECRET || '',
        CONNECTIONS_TABLE: connectionsTable.tableName,
        JOBS_TABLE: jobsTable.tableName,
        WEBSOCKET_ENDPOINT: webSocketUrl
      }
    });
    connectionsTable.grantReadWriteData(entryApiLambda);
    jobsTable.grantReadWriteData(entryApiLambda);

    connectionsTable.grantReadWriteData(webSocketLambda);
    jobsTable.grantReadWriteData(webSocketLambda);
    webSocketApi.grantManageConnections(webSocketLambda);
    webSocketApi.grantManageConnections(entryApiLambda);
    webSocketLambda.addPermission('WebSocketConnectPermission', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:${webSocketApi.apiId}/*/*`
    });

    const webSocketIntegration = new apigwv2integrations.WebSocketLambdaIntegration('WebSocketIntegration', webSocketLambda);

    webSocketApi.addRoute('$connect', {
      integration: webSocketIntegration
    });
    webSocketApi.addRoute('$disconnect', {
      integration: webSocketIntegration
    });
    webSocketApi.addRoute('$default', {
      integration: webSocketIntegration
    });

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

    new CfnOutput(this, 'WebSocketUrl', {
      value: webSocketStage.url,
      description: 'WebSocket URL'
    });
  }
}
