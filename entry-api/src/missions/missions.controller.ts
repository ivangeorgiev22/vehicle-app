import { Controller, Get, Post, Patch, Body, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { CreateMissionRequest } from "./models/create-mission";
import type { UpdateMission } from "./models/update-mission";
import { MissionsService } from "./missions.service";
import { RolesGuard } from "../roles/roles.guard";
import { Roles } from "../roles/roles.decorator";


@Controller('missions')
@UseGuards(AuthGuard('jwt'))
export class MissionsController {
  constructor(private missionsService: MissionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(@Body() req: CreateMissionRequest) {
    return this.missionsService.create(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.missionsService.findOne(+id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() req: UpdateMission) {
    return this.missionsService.updateStatus(+id, req);
  }
}