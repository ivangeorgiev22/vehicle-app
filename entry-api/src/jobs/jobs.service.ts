import { Injectable } from "@nestjs/common";
import { ApiClient } from "../core-client/api-client";
import { UpdateJobStatus } from "./models/UpdateJobStatus";
import { Task } from "./models/UpdateTaskStatus";
import { Job } from "./interfaces/job-interface";

@Injectable()
export class JobsService {
  constructor(private coreApi: ApiClient) {}

  updateStatus(id: string, req: UpdateJobStatus): Promise<Job | null> {
    return this.coreApi.updateJobStatus(id, req.jobStatus);
  }

  updateTaskStatus(id: string, key: string, req: Pick<Task, 'taskStatus'>): Promise<Job | null> {
    return this.coreApi.updateTaskStatus(id,key, req.taskStatus);
  }

  getBacklogJobs(): Promise<Job[]> {
    return this.coreApi.getBacklogJobs();
  }

  getJobById(id: string): Promise<Job | null> {
    return this.coreApi.getJobById(id);
  }
}