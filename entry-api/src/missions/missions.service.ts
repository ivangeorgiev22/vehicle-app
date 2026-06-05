import { Injectable } from "@nestjs/common";
import { ApiClient } from "../core-client/api-client";
import { CreateMissionRequest } from "./models/create-mission";
import { UpdateMission } from "./models/update-mission";
import { Mission, MissionWithJobs } from "./interfaces/missions-interface";
import { JobsGateway } from "../jobs/jobs.gateway";

@Injectable()
export class MissionsService {
  constructor(private coreApi: ApiClient, private jobsGateway: JobsGateway) {}

  async create(req: CreateMissionRequest): Promise<Mission> {
    const mission = await this.coreApi.createMission(req.mission_type);
    //we push updated list to all connections
    await this.jobsGateway.broadcastJobs();
    return mission;
  }

  findOne(id: number): Promise<MissionWithJobs> {
    return this.coreApi.getMission(id);
  }

  updateStatus(id: number, req: UpdateMission): Promise<Mission | null> {
    return this.coreApi.updateMissionStatus(id, req.mission_status);
  }
}