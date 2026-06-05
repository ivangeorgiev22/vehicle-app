import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { CreateMissionRequest } from "./models/CreateMissionRequest";
import { MissionStatus} from './models/UpdateMissionStatus';
import { JobsService } from "../jobs/jobs.service";
import { Mission, MissionWithJobs } from "./interfaces/mission-interface";

@Injectable()
export class MissionsService {
  constructor(private dbService: DatabaseService, private jobsService: JobsService) {}

  async create(req: CreateMissionRequest): Promise<Mission | undefined> {
    const db = this.dbService.getDB();

    const res = await db.run(
      `INSERT INTO missions (mission_type) VALUES (?)`, req.mission_type
    );

    await this.jobsService.createJob(Number(res.lastID), req.mission_type)

    return db.get(
      `SELECT * FROM missions WHERE id = ?`, res.lastID
    );

  };

  async findOne(id: number): Promise<MissionWithJobs | null> {
    const db = this.dbService.getDB();
    const mission = await db.get(
      `SELECT * FROM missions WHERE id = ?`, id
    );

    if (!mission) {
      return null;
    }

    const jobs = await db.all(
      `SELECT * FROM jobs WHERE mission_id = ?`, id
    )

    return {
      ...mission,
      jobs: jobs.map(job => ({
        ...job,
        tasks: JSON.parse(job.tasks)
      })),
    };
  }

  async updateStatus(id: number, req: MissionStatus): Promise<Mission | null | undefined> {
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