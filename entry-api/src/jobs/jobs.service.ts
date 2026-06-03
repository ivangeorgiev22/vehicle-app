import { Injectable } from "@nestjs/common";
import { ApiClient } from "../core-client/api-client";
import { UpdateJobStatus } from "./models/UpdateJobStatus";
import { Task } from "./models/UpdateTaskStatus";

@Injectable()
export class JobsService {
  constructor(private coreApi: ApiClient) {}

  updateStatus(id: number, req: UpdateJobStatus ) {
    return this.coreApi.updateJobStatus(id, req.job_status);
  }

  updateTaskStatus(id: number, key: string, req: Pick<Task, 'task_status'>) {
    return this.coreApi.updateTaskStatus(id,key, req.task_status);
  }

  getBacklogJobs() {
    return this.coreApi.getBacklogJobs();
  }

  getJobById(id: number) {
    return this.coreApi.getJobById(id);
  }
}