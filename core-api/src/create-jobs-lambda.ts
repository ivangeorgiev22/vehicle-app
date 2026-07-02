import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { missionTemplates } from "./jobs/job-templates";

const client = DynamoDBDocumentClient.from(new DynamoDBClient());

export const handler = async (event: any) => {
  const { id: missionId, missionType, vehicleId } = event;
  const jobs = missionTemplates[missionType];

  const createdJobs = jobs.map(job => ({
    id: randomUUID(),
    missionId,
    vehicleId,
    jobTitle: job.jobTitle,
    jobStatus: 'Backlog',
    tasks: job.tasks
  }));

  await client.send(new BatchWriteCommand({
    RequestItems: {
      [process.env.JOBS_TABLE!]: createdJobs.map(job => ({
        PutRequest: {
          Item: {
            ...job,
            tasks: JSON.stringify(job.tasks)
          }
        }
      }))
    }
  }));

  return {
    missionId,
    missionType,
    vehicleId,
    jobsCount: createdJobs.length,
    tasksCount: createdJobs.reduce((sum, job) => sum + job.tasks.length, 0)
  };
};