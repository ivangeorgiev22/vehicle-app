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
    console.log('Creating mission, broadcastjobs next')
    const mission = await this.coreApi.createMission(req.mission_type);
    console.log('mission created, calling broadcastJobs');
    await this.jobsGateway.broadcastJobs();
    console.log('broadcastJobs called');
    return mission;
  }

  findOne(id: string): Promise<MissionWithJobs> {
    return this.coreApi.getMission(id);
  }

  updateStatus(id: string, req: UpdateMission): Promise<Mission | null> {
    return this.coreApi.updateMissionStatus(id, req.mission_status);
  }
}