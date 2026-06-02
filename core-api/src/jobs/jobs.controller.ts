import { Controller, Patch, Param, Body, NotFoundException } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import type { UpdateJobStatus } from "./interfaces/UpdateJobStatus";
import { Task } from "./interfaces/job.interface";

@Controller('jobs')
export class JobsController {
  constructor (private jobsService: JobsService) {}

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() req: UpdateJobStatus) {
    const job = await this.jobsService.updateJobStatus(+id, req);
    if (!job) {
      throw new NotFoundException('Job not found')
    }
    return job;
  }

  @Patch(':id/task/:key/status')
  async updateTaskStatus(
    @Param('id') id: string, 
    @Param('key') key: string,
    @Body() req: Pick<Task, 'task_status'>
  ) {
    const job = await this.jobsService.updateTaskStatus(+id, key, req.task_status);

    if (!job) {
      throw new NotFoundException('Task not found')
    };

    return job;
  }
}