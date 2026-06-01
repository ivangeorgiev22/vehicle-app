import { Controller, Get, Post, Body, NotFoundException, Param, Patch } from "@nestjs/common";
import { MissionsService } from "./missions.service";
import type { CreateMissionRequest } from "./models/CreateMissionRequest";
import type { MissionStatus } from "./models/UpdateMissionStatus";

@Controller('missions')
export class MissionsController {
  constructor(private missionsService: MissionsService) {}

  @Post()
  create(@Body() req: CreateMissionRequest) {
    return this.missionsService.create(req);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const mission = await this.missionsService.findOne(+id);

    if(!mission) {
      throw new NotFoundException('Mission not found!');
    }

    return mission;
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() req: MissionStatus) {
    const mission = await this.missionsService.updateStatus(+id, req);

    if (!mission) {
      throw new NotFoundException('Mission not found!')
    }

    return mission;
  }
}