import { Injectable } from "@nestjs/common";
import { CreateMissionRequest } from "./models/CreateMissionRequest";
import { MissionStatus} from './models/UpdateMissionStatus';
import { JobsService } from "../jobs/jobs.service";
import { Mission, MissionWithJobs } from "./interfaces/mission-interface";
import { DynamoDBService } from "../database/dynamodb.service";
import { PutCommand, QueryCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Job } from "../jobs/interfaces/job.interface";
import { randomUUID } from "crypto";
import { EmailService } from "../emails/email.service";

@Injectable()
export class MissionsService {
  constructor(private dbService: DynamoDBService, private jobsService: JobsService, private emailService: EmailService) {}

  async create(req: CreateMissionRequest): Promise<Mission | undefined> {
    const db = this.dbService.getDb();
    const id = randomUUID();
    const mission: Mission = {
      id,
      mission_type: req.mission_type,
      mission_status: 'Created'
    };

    await db.send(new PutCommand({
      TableName: this.dbService.getMissionsTable(),
      Item: mission
    }));

    const jobs = await this.jobsService.createJob(id, req.mission_type);
    await this.emailService.sendEmail(req.mission_type, id, jobs);

    return mission;
  };

  async findOne(id: string): Promise<MissionWithJobs | null> {
    const db = this.dbService.getDb();
    const mission = await db.send(new GetCommand({
      TableName: this.dbService.getMissionsTable(),
      Key: {id}
    }));

    if (!mission) {
      return null;
    }
    //get all jobs for mission using GSI
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
    // check if mission exists
    const mission = await db.send(new GetCommand({
      TableName: this.dbService.getMissionsTable(),
      Key: {id}
    }));

    if(!mission) {
      return null;
    }
    // run the update 
    await db.send(new UpdateCommand({
      TableName: this.dbService.getMissionsTable(),
      Key: {id},
      UpdateExpression: 'SET mission_status = :mission_status',
      ExpressionAttributeValues: {
        ':mission_status': req.mission_status
      }
    }));
    // return updated mission
    return {
      ...mission.Item as Mission,
    }
  }
}