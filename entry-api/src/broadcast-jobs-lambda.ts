import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import axios from "axios";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient());

export const handler = async (event: any) => {
  const jobs = await axios.get(`${process.env.BASE_URL}/api/jobs`);
  const connections = await dynamoDb.send(new ScanCommand({
    TableName: process.env.CONNECTIONS_TABLE
  }));
  const apiClient = new ApiGatewayManagementApiClient({endpoint: process.env.WEBSOCKET_ENDPOINT});

  await Promise.all(
    (connections.Items || []).map(async (connection) => {
      try {
        await apiClient.send(new PostToConnectionCommand({
          ConnectionId: connection.connectionId,
          Data: JSON.stringify({type: 'jobs:backlog', jobs: jobs.data})
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