import { Injectable } from "@nestjs/common";
import { MissionStatus} from './models/UpdateMissionStatus';
import { Mission, MissionWithJobs } from "./interfaces/mission-interface";
import { DynamoDBService } from "../database/dynamodb.service";
import { QueryCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Job } from "../jobs/interfaces/job.interface";

@Injectable()
export class MissionsService {
  constructor(private dbService: DynamoDBService) {}

  async findOne(id: string): Promise<MissionWithJobs | null> {
    const db = this.dbService.getDb();
    const mission = await db.send(new GetCommand({
      TableName: this.dbService.getMissionsTable(),
      Key: {id}
    }));

    if (!mission) {
      return null;
    }
    const jobsRes = await db.send(new QueryCommand({
      TableName: this.dbService.getJobsTable(),
      IndexName: 'mission-id-index',
      KeyConditionExpression: 'mission_id = :mission_id',
      ExpressionAttributeValues: {
        ':mission_id': id
      }
    }));

    const jobs = (jobsRes.Items || []).map(job => ({
      ...job,
      tasks: typeof job.tasks === 'string' ? JSON.parse(job.tasks) : job.tasks
    })) as Job[];

    return {
      ...mission.Item as Mission,
      jobs
    };
  }

  async updateStatus(id: string, req: MissionStatus): Promise<Mission | null | undefined> {
    const db = this.dbService.getDb();
    const mission = await db.send(new GetCommand({
      TableName: this.dbService.getMissionsTable(),
      Key: {id}
    }));

    if(!mission) {
      return null;
    }
    await db.send(new UpdateCommand({
      TableName: this.dbService.getMissionsTable(),
      Key: {id},
      UpdateExpression: 'SET mission_status = :mission_status',
      ExpressionAttributeValues: {
        ':mission_status': req.mission_status
      }
    }));
    return {
      ...mission.Item as Mission,
    }
  }
}