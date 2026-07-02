import { Injectable } from "@nestjs/common";
import { ApiClient } from "../core-client/api-client";
import { CreateVehicleRequest } from "./models/create-vehicle-req";
import { UpdateVehicleStatus } from "./models/update-vehicle-status";
import { Vehicle } from "./interfaces/vehicle-interface";


@Injectable()
export class VehiclesService {
  constructor(private coreApi: ApiClient) {}

  create(req: CreateVehicleRequest): Promise<Vehicle> {
    return this.coreApi.createVehicle(req.plate, req.battery);
  }

  getAll(): Promise<Vehicle[]> {
    return this.coreApi.getVehicles();
  }

  updateStatus(id: string, req: UpdateVehicleStatus): Promise<Vehicle> {
    return this.coreApi.updateVehicleStatus(id, req.vehicleStatus);
  }
}