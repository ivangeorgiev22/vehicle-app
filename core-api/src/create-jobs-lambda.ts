import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { mission_templates } from "./jobs/job-templates";

const client = DynamoDBDocumentClient.from(new DynamoDBClient());

export const handler = async (event: any) => {
  const { id: mission_id, mission_type } = event;
  const jobs = mission_templates[mission_type];
  const createdJobs: any[] = [];

  for (const job of jobs) {
    const id = randomUUID();
    await client.send(new PutCommand({
      TableName: process.env.JOBS_TABLE,
      Item: {
        id,
        mission_id,
        job_title: job.job_title,
        job_status: 'Backlog',
        tasks: JSON.stringify(job.tasks)
      }
    }));
    createdJobs.push({
      id,
      mission_id,
      job_title: job.job_title,
      job_status: 'Backlog',
      tasks: job.tasks
    });
  }
  return {
    mission_id,
    mission_type,
    jobsCount: createdJobs.length,
    tasksCount: createdJobs.reduce((sum, job) => sum + job.tasks.length, 0)
  };
};