import { Injectable } from "@nestjs/common";
import { mission_templates } from "./job-templates";
import { UpdateJobStatus } from "./interfaces/UpdateJobStatus";
import { Job, Task } from "./interfaces/job.interface";
import { DynamoDBService } from "../database/dynamodb.service";
import { GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";


@Injectable()
export class JobsService {
  constructor (private dbService: DynamoDBService) {}

  async createJob (mission_id: string, mission_type: string): Promise<Job[]> {
    const db = this.dbService.getDb();
    const jobs = mission_templates[mission_type];
    const id = randomUUID();
    const createdJobs: Job[] = [];

    for (const job of jobs) {
      await db.send(new PutCommand({
        TableName: this.dbService.getJobsTable(),
        Item: { 
          id,
          mission_id,
          job_title: job.job_title,
          job_status: 'Backlog',
          tasks: JSON.stringify(job.tasks)
        }
      }));
      createdJobs.push({
        ...job,
        tasks: job.tasks
      } as Job)
    }
    return createdJobs;
  }

  async updateJobStatus (id: string, req: UpdateJobStatus): Promise<Job | null | undefined> {
    const db = this.dbService.getDb();
    const job = await db.send(new GetCommand({
      TableName: this.dbService.getJobsTable(),
      Key: {id}
    }));

    if (!job) {
      return null;
    }

    await db.send(new UpdateCommand({
      TableName: this.dbService.getJobsTable(),
      Key: {id},
      UpdateExpression: 'SET job_status = :job_status',
      ExpressionAttributeValues: {
        ':job_status': req.job_status
      }
    }));

    return {
      ...job.Item as Job
    }
  }

  async updateTaskStatus(id: string, key: string, task_status: Task['task_status']): Promise<Job | null> {
    const db = this.dbService.getDb();
    const job = await db.send(new GetCommand({
      TableName: this.dbService.getJobsTable(),
      Key: {id}
    }));

    if(!job) return null;

    //parsing tasks
    const tasks: Task[] = typeof job.Item!.tasks === 'string'
    ? JSON.parse(job.Item!.tasks)
    : job.Item!.tasks;

    //finding the task we need by key
    const task = tasks.find((t: Task) => t.key === key);
    if(!task) return null;

    // updating task status
    task.task_status = task_status

    //stringify tasks and save
    await db.send(new UpdateCommand({
      TableName: this.dbService.getJobsTable(),
      Key: {id},
      UpdateExpression: 'SET tasks = :tasks',
      ExpressionAttributeValues: {
        ':tasks': JSON.stringify(tasks)
      }
    }));

    return {
     ...job.Item as Job,
     tasks
    }
  }

  async backlogJobs(): Promise<Job[]> {
    const db = this.dbService.getDb();
    const jobs = await db.send(new ScanCommand({
      TableName: this.dbService.getJobsTable(),
      FilterExpression: 'job_status = :job_status',
      ExpressionAttributeValues: {
        ':job_status': 'Backlog'
      }
    }));

    return (jobs.Items || []).map(job => ({
      ...job,
      tasks: typeof job.tasks === 'string' ? JSON.parse(job.tasks) : job.tasks
    })) as Job[];
  }

  async getJobById(id: string): Promise<Job | null> {
    const db = this.dbService.getDb();
    const job = await db.send(new GetCommand({
      TableName: this.dbService.getJobsTable(),
      Key: {id}
    }))
    if (!job) return null;

    return {
      ...job.Item as Job,
      tasks: typeof job.Item!.tasks === 'string' ? JSON.parse(job.Item!.tasks) : job.Item!.tasks
    }
  }
}

