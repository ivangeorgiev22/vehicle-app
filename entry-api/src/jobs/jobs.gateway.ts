import { Injectable } from "@nestjs/common";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { JobsService } from "./jobs.service";

@Injectable()
export class JobsGateway {
  private dynamoDbClient = DynamoDBDocumentClient.from(new DynamoDBClient());
  private connectionsTable = process.env.CONNECTIONS_TABLE;
  private webSocketEndpoint = process.env.WEBSOCKET_ENDPOINT;

  constructor(private jobsService: JobsService) {}

  //Send jobs to connected client
  async sendJobs(connectionId: string) {
    const jobs = await this.jobsService.getBacklogJobs();
    const apiClient = new ApiGatewayManagementApiClient({endpoint: this.webSocketEndpoint});

    await apiClient.send(new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify({type: 'jobs:backlog', jobs})
    }));
  }

  //whenever jobs change call this to push updated to all connected clients
  async broadcastJobs() {
    const jobs = await this.jobsService.getBacklogJobs();
    const apiClient = new ApiGatewayManagementApiClient({endpoint: this.webSocketEndpoint});
    const connections = await this.dynamoDbClient.send(new ScanCommand({
      TableName: this.connectionsTable,
    }));

    await Promise.all(
      (connections.Items || []).map(async (connection) => {
        try {
          await apiClient.send(new PostToConnectionCommand({
            ConnectionId: connection.connectionId,
            Data: JSON.stringify({type: 'jobs:backlog', jobs})
          }));
        } catch {
          //remove stale connections
          await this.dynamoDbClient.send(new DeleteCommand({
            TableName: this.connectionsTable,
            Key: {connectionId: connection.connectionId}
          }));
        }
      })
    );
  };
};