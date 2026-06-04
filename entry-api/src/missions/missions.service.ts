import { Injectable } from "@nestjs/common";
import { ApiClient } from "../core-client/api-client";
import { CreateMissionRequest } from "./models/create-mission";
import { UpdateMission } from "./models/update-mission";
import { Mission, MissionWithJobs } from "./interfaces/missions-interface";

@Injectable()
export class MissionsService {
  constructor(private coreApi: ApiClient) {}

  create(req: CreateMissionRequest): Promise<Mission> {
    return this.coreApi.createMission(req.mission_type);
  }

  findOne(id: number): Promise<MissionWithJobs> {
    return this.coreApi.getMission(id);
  }

  updateStatus(id: number, req: UpdateMission): Promise<Mission | null> {
    return this.coreApi.updateMissionStatus(id, req.mission_status);
  }
}