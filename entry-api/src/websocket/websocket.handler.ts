import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());
const connectionsTable = process.env.CONNECTIONS_TABLE;
const jobsTable = process.env.JOBS_TABLE;
const webSocketEndpoint = process.env.WEBSOCKET_ENDPOINT;

export const webSocketHandler = async (event) => {
  const {routeKey, connectionId} = event.requestContext;

  if (routeKey === '$connect') {
    await dynamoClient.send(new PutCommand({
      TableName: connectionsTable,
      Item: {connectionId}
    }));

    await broadcastJobs();
    return {statusCode: 200, body: 'Connected'};
  }
  if (routeKey === '$disconnect') {
    await dynamoClient.send(new DeleteCommand({
      TableName: connectionsTable,
      Key: {connectionId}
    }));
    
    return {statusCode: 200, body: 'Disconnected'};
  }
  return {statusCode: 200, body: 'OK'};
}

export const broadcastJobs = async () => {
  const apiClient = new ApiGatewayManagementApiClient({endpoint: webSocketEndpoint});

  const connections = await dynamoClient.send(new ScanCommand({
    TableName: connectionsTable
  }));

  const res = connections.Items || [];

  //get jobs
  const jobs = await dynamoClient.send(new ScanCommand({
    TableName: jobsTable,
    FilterExpression: 'job_status = :status',
    ExpressionAttributeValues: {':status': 'Backlog'}
  }));

  const jobsRes = jobs.Items || [];

  //send jobs to all connected clients
  await Promise.all(
    res.map(async (connection) => {
      try {
        await apiClient.send(new PostToConnectionCommand({
          ConnectionId: connection.connectionId,
          Data: JSON.stringify({type: 'jobs:backlog', jobsRes})
        }));
      } catch {
        //if connection is not ok delete it
        await dynamoClient.send(new DeleteCommand({
          TableName: connectionsTable,
          Key: {connectionId: connection.connectionId}
        }));
      }
    })
  )
}