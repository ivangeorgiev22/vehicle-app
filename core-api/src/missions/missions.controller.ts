import { Controller, Get, Post, Body, NotFoundException, Param, Patch } from "@nestjs/common";
import { MissionsService } from "./missions.service";
import type { CreateMissionRequest } from "./models/CreateMissionRequest";
import type { MissionStatus } from "./models/UpdateMissionStatus";
import { Mission, MissionWithJobs } from "./interfaces/mission-interface";

@Controller('api/missions')
export class MissionsController {
  constructor(private missionsService: MissionsService) {}

  @Post()
  async create(@Body() req: CreateMissionRequest): Promise<Mission | undefined> {
    return await this.missionsService.create(req);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MissionWithJobs> {
    const mission = await this.missionsService.findOne(id);

    if(!mission) {
      throw new NotFoundException('Mission not found!');
    }

    return mission;
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() req: MissionStatus): Promise<Mission> {
    const mission = await this.missionsService.updateStatus(id, req);

    if (!mission) {
      throw new NotFoundException('Mission not found!')
    }

    return mission;
  }
}