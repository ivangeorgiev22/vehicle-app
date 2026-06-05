import { Controller, Param, Body, Patch, UseGuards, Get } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JobsService } from "./jobs.service";
import type { UpdateJobStatus } from "./models/UpdateJobStatus";
import { Task } from "./models/UpdateTaskStatus";
import { Job } from "./interfaces/job-interface";

@Controller('jobs')
@UseGuards(AuthGuard('jwt'))
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() req: UpdateJobStatus): Promise<Job | null> {
    const job = await this.jobsService.updateStatus(+id, req);
    return job;
  }

  @Patch(':id/task/:key/status')
  async updateTaskStatus(@Param('id') id: string, @Param('key') key: string, @Body() req: Pick<Task, 'task_status'>): Promise<Job | null> {
    const task = await this.jobsService.updateTaskStatus(+id, key, req);
    return task;
  }

  @Get()
  async getBacklogJobs(): Promise<Job[]> {
    const jobs = await this.jobsService.getBacklogJobs();
    return jobs;
  };

  @Get(':id')
  async getJobById(@Param('id') id: string): Promise<Job | null> {
    const job = await this.jobsService.getJobById(+id);
    return job;
  } 

}