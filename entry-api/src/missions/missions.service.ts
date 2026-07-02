import { Injectable } from "@nestjs/common";
import { ApiClient } from "../core-client/api-client";
import { CreateMissionRequest } from "./models/create-mission";
import { UpdateMission } from "./models/update-mission";
import { Mission, MissionWithJobs } from "./interfaces/missions-interface";
import { JobsGateway } from "../jobs/jobs.gateway";
import {SFNClient, StartExecutionCommand} from '@aws-sdk/client-sfn';

@Injectable()
export class MissionsService {
  constructor(private coreApi: ApiClient, private jobsGateway: JobsGateway) {}
  private sfnClient = new SFNClient();

  async create(req: CreateMissionRequest): Promise<void> {
    await this.sfnClient.send(new StartExecutionCommand({
      stateMachineArn: process.env.STATE_MACHINE_ARN,
      input: JSON.stringify({missionType: req.missionType, vehicleId: req.vehicleId})
    }));
    await this.jobsGateway.broadcastJobs();
  }

  findOne(id: string): Promise<MissionWithJobs> {
    return this.coreApi.getMission(id);
  }

  updateStatus(id: string, req: UpdateMission): Promise<Mission | null> {
    return this.coreApi.updateMissionStatus(id, req.missionStatus);
  }
}