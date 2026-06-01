import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { CreateMissionRequest } from "./models/CreateMissionRequest";
import { MissionStatus} from './models/UpdateMissionStatus';

@Injectable()
export class MissionsService {
  constructor(private dbService: DatabaseService) {}

  async create(req: CreateMissionRequest) {
    const db = this.dbService.getDB();

    const res = await db.run(
      `INSERT INTO missions (mission_type) VALUES (?)`, req.mission_type
    );

    return db.get(
      `SELECT * FROM missions WHERE id = ?`, res.lastID
    );

  };

  async findOne(id: number) {
    const db = this.dbService.getDB();
    const mission = await db.get(
      `SELECT * FROM missions WHERE id = ?`, id
    );

    if (!mission) {
      return null;
    }

    return mission;
  }

  async updateStatus(id: number, req: MissionStatus) {
    const db = this.dbService.getDB();
    // check if mission exists
    const mission = await db.get(`SELECT * FROM missions WHERE id = ?`, id);

    if(!mission) {
      return null;
    }
    // run the update 
    await db.run(
      `UPDATE missions SET mission_status = ? WHERE id = ?`,
      req.mission_status,
      id
    );
    // return updated mission
    return db.get(`SELECT * FROM missions WHERE id = ?`, id);
  }
}