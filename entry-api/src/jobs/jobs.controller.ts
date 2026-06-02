import { Controller, Param, Body, Patch, UseGuards } from "@nestjs/common";
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
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async updateStatus(@Param('id') id: string, @Body() req: UpdateJobStatus) {
    return this.jobsService.updateStatus(+id, req);
  }

  @Patch(':id/task/:key/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async updateTaskStatus(@Param('id') id: string, @Param('key') key: string, @Body() req: Pick<Task, 'task_status'>) {
    return this.jobsService.updateTaskStatus(+id, key, req);
  }
}