import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient());

export const handler = async (event: any) => {
  const getJobs = await dynamoDb.send(new ScanCommand({
    TableName: process.env.JOBS_TABLE,
    FilterExpression: 'jobStatus = :status',
    ExpressionAttributeValues: {
      ':status': 'Backlog'
    }
  }));

  const jobs = await Promise.all(
    (getJobs.Items || []).map(async (job) => {
      const tasks = typeof job.tasks === 'string' ? JSON.parse(job.tasks) : job.tasks;
      if (!job.vehicleId) return {...job, tasks, vehicle: null};
      const vehicle = await dynamoDb.send(new GetCommand({
        TableName: process.env.VEHICLES_TABLE,
        Key: {id: job.vehicleId}
      }));
      return {
        ...job,
        tasks,
        vehicle: {plate: vehicle.Item?.plate || null}
      };
    })
  );

  const connections = await dynamoDb.send(new ScanCommand({
    TableName: process.env.CONNECTIONS_TABLE
  }));
  const apiClient = new ApiGatewayManagementApiClient({endpoint: process.env.WEBSOCKET_ENDPOINT});

  await Promise.all(
    (connections.Items || []).map(async (connection) => {
      try {
        await apiClient.send(new PostToConnectionCommand({
          ConnectionId: connection.connectionId,
          Data: JSON.stringify({type: 'jobs:backlog', jobs})
        }));
      } catch (error) {
        await dynamoDb.send(new DeleteCommand({
          TableName: process.env.CONNECTIONS_TABLE,
          Key: {connectionId: connection.connectionId}
        }));
      }
    })
  )
  return event;
}