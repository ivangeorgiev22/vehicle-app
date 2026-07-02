import { Controller, Get, Post, Patch, Body, Param, UseGuards, NotFoundException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { CreateMissionRequest } from "./models/create-mission";
import type { UpdateMission } from "./models/update-mission";
import { MissionsService } from "./missions.service";
import { RolesGuard } from "../roles/roles.guard";
import { Roles } from "../roles/roles.decorator";
import { Mission, MissionWithJobs } from "./interfaces/missions-interface";


@Controller('missions')
@UseGuards(AuthGuard('jwt'))
export class MissionsController {
  constructor(private missionsService: MissionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() req: CreateMissionRequest): Promise<void> {
    return await this.missionsService.create(req);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MissionWithJobs> {
    const mission = await this.missionsService.findOne(id);

    if(!mission) {
      throw new NotFoundException('Mission not found')
    }

    return mission;
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() req: UpdateMission): Promise<Mission> {
    const mission = await this.missionsService.updateStatus(id, req);

    if(!mission) {
      throw new NotFoundException('Mission not found');
    }

    return mission;
  }
}