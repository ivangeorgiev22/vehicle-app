import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { JobsGateway } from "./jobs/jobs.gateway";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

let jobsGateway: JobsGateway
const dynamoDbCli = DynamoDBDocumentClient.from(new DynamoDBClient());

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
    // await jobsGateway.sendJobs(connectionId);
    return {statusCode: 200, body: 'Connected'};
  }

  if(routeKey === '$default') {
    console.log('$default triggered, body:', event.body);
    const body = event.body ? JSON.parse(event.body) : {};
    if (body.action === 'getBacklogJobs') {
      await jobsGateway.sendJobs(connectionId);
    }
    return {statusCode: 200, body: 'OK'}
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