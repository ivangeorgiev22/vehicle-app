import { Injectable } from "@nestjs/common";
import { ApiClient } from "../core-client/api-client";
import { CreateMissionRequest } from "./models/create-mission";
import { UpdateMission } from "./models/update-mission";

@Injectable()
export class MissionsService {
  constructor(private coreApi: ApiClient) {}

  create(req: CreateMissionRequest) {
    return this.coreApi.createMission(req.mission_type);
  }

  findOne(id: number) {
    return this.coreApi.getMission(id);
  }

  updateStatus(id: number, req: UpdateMission) {
    return this.coreApi.updateMissionStatus(id, req.mission_status);
  }
}