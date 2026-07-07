import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { JobsGateway } from "./jobs/jobs.gateway";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

let jobsGateway: JobsGateway;
const dynamoDbCli = DynamoDBDocumentClient.from(new DynamoDBClient());

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true
});

async function getSigningKey(kid: string):Promise<string> {
  const key = await client.getSigningKey(kid);
  return key.getPublicKey();
};

async function verifyToken(token: string):Promise<boolean> {
  try {
    const decoded = jwt.decode(token, {complete: true});
    if (!decoded || typeof decoded === 'string') return false;

    const kid = decoded.header.kid;
    if (!kid) return false;

    const signingKey = await getSigningKey(kid);

    jwt.verify(token, signingKey, {
      audience: process.env.AUTH0_AUDIENCE!,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    });
    return true;
  } catch {
    return false;
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  jobsGateway = app.get(JobsGateway);
}

export const webSocketHandler = async(event: any) => {
  if (!jobsGateway) {
    await bootstrap();
  }
  
  console.log('routeKey:', event.requestContext.routeKey);
  const {routeKey, connectionId} = event.requestContext;

  if(routeKey === '$connect') {
    console.log('$connect triggered');
    await dynamoDbCli.send(new PutCommand({
      TableName: process.env.CONNECTIONS_TABLE,
      Item: {connectionId}
    }));
    console.log('connectionId saved to Db');
    return {statusCode: 200, body: 'Connected'};
  }

  if(routeKey === '$default') {
    console.log('$default triggered, body:', event.body);
    const body = event.body ? JSON.parse(event.body) : {};
    const isValid = await verifyToken(body.token);

    if(!isValid) {
      const apiClient = new ApiGatewayManagementApiClient({endpoint: process.env.WEBSOCKET_ENDPOINT});
      await apiClient.send(new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify({type: 'auth:expired'})
      }));
      return {statusCode: 200, body: 'OK'};
    }

    if(body.action === 'getBacklogJobs') {
      await jobsGateway.sendJobs(connectionId);
    }
    return {statusCode: 200, body: 'OK'};
  }

  if(routeKey === '$disconnect') {
    await dynamoDbCli.send(new DeleteCommand({
      TableName: process.env.CONNECTIONS_TABLE,
      Key: {connectionId}
    }));
    return {statusCode: 200, body: 'Disconnected'};
  }
  return {statusCode: 200, body: 'OK'};
}