import { Controller, Get, Post, Patch, Body, Param, NotFoundException } from "@nestjs/common";
import { VehiclesService } from "./vehicles.service";
import type { CreateVehicleRequest } from "./models/create-vehicle-req";
import type { UpdateVehicleStatus } from "./models/update-vehicle-status";
import { Vehicle } from "./interfaces/vehicle-interface";

@Controller('api/vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post()
  async create(@Body() req: CreateVehicleRequest): Promise<Vehicle> {
    return await this.vehiclesService.create(req);
  }

  @Get()
  async findAll(): Promise<Vehicle[]> {
    return await this.vehiclesService.findAll();
  }

  @Patch(':vehicleId/status')
  async updateStatus(@Param('vehicleId') vehicleId:string, @Body() req: UpdateVehicleStatus): Promise<Vehicle> {
    const vehicle = await this.vehiclesService.updateStatus(vehicleId, req);
    if (!vehicle) throw new NotFoundException('Vehicle Not Found');
    return vehicle;
  }
}