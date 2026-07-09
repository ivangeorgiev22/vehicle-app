import { Injectable } from "@nestjs/common";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { JobsService } from "./jobs.service";

@Injectable()
export class JobsGateway {
  private webSocketEndpoint = process.env.WEBSOCKET_ENDPOINT;

  constructor(private jobsService: JobsService) {}

  async sendJobs(connectionId: string) {
    const jobs = await this.jobsService.getBacklogJobs();
    const apiClient = new ApiGatewayManagementApiClient({endpoint: this.webSocketEndpoint});

    await apiClient.send(new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify({type: 'jobs:backlog', jobs})
    }));
  }
};