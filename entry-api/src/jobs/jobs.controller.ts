import { Controller, Param, Body, Patch, UseGuards, Get } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../roles/roles.guard";
import { Roles } from "../roles/roles.decorator";
import { JobsService } from "./jobs.service";
import type { UpdateJobStatus } from "./models/UpdateJobStatus";
import { Task } from "./models/UpdateTaskStatus";

@Controller('jobs')
@UseGuards(AuthGuard('jwt'))
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() req: UpdateJobStatus) {
    const job = await this.jobsService.updateStatus(+id, req);
    return job;
  }

  @Patch(':id/task/:key/status')
  async updateTaskStatus(@Param('id') id: string, @Param('key') key: string, @Body() req: Pick<Task, 'task_status'>) {
    const task = await this.jobsService.updateTaskStatus(+id, key, req);
    return task;
  }

  @Get()
  async getBacklogJobs() {
    const jobs = await this.jobsService.getBacklogJobs();
    return jobs;
  };

  @Get(':id')
  async getJobById(@Param('id') id: string) {
    const job = await this.jobsService.getJobById(+id);
    return job;
  } 

}