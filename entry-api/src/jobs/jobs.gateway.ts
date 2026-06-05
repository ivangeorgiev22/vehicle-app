import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JobsService } from "./jobs.service";

@WebSocketGateway({cors: {origin: '*'}})
export class JobsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private jobsService: JobsService) {}

  @WebSocketServer()
  server!: Server;

  // when client connects
  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`)

    const jobs = await this.jobsService.getBacklogJobs();
    client.emit('jobs:backlog', jobs);
  };
  //when client disconnects
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`)
  };

  //whenever jobs change call this to push updated to all connected clients
  async broadcastJobs() {
    const jobs = await this.jobsService.getBacklogJobs();
    this.server.emit('jobs:backlog', jobs);
  };
}