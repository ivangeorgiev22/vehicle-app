import { Controller, Get, Post, Param, Body, UseGuards, NotFoundException, Patch } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { VehiclesService } from "./vehicles.service";
import type { CreateVehicleRequest } from "./models/create-vehicle-req";
import type { UpdateVehicleStatus } from "./models/update-vehicle-status";
import { Vehicle } from "./interfaces/vehicle-interface";
import { RolesGuard } from "../roles/roles.guard";
import { Roles } from "../roles/roles.decorator";

@Controller('vehicles')
@UseGuards(AuthGuard('jwt'))
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() req: CreateVehicleRequest): Promise<Vehicle> {
    return await this.vehiclesService.create(req);
  }

  @Get()
  async getAll(): Promise<Vehicle[]> {
    return await this.vehiclesService.getAll();
  }

  @Patch(':vehicleId/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async updateStatus(@Param('vehicleId') vehicleId: string, @Body() req: UpdateVehicleStatus): Promise<Vehicle> {
    const vehicle = await this.vehiclesService.updateStatus(vehicleId, req);
    if (!vehicle) throw new NotFoundException('Vehicle Not Found');
    return vehicle;
  }
}