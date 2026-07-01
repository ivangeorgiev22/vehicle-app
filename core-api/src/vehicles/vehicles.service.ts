import { Injectable } from "@nestjs/common";
import { DynamoDBService } from "../database/dynamodb.service";
import { PutCommand, GetCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { CreateVehicleRequest } from "./models/create-vehicle-req";
import { Vehicle } from "./interfaces/vehicle-interface";
import { randomUUID } from "crypto";
import { UpdateVehicleStatus } from "./models/update-vehicle-status";

@Injectable()
export class VehiclesService {
  constructor(private dbService: DynamoDBService) {}

  async create(req: CreateVehicleRequest): Promise<Vehicle> {
    const db = this.dbService.getDb();
    const vehicleId = randomUUID();
    const vehicle: Vehicle = {
      vehicleId,
      plate: req.plate,
      battery: req.battery,
      vehicle_status: 'Available'
    };

    await db.send(new PutCommand({
      TableName: this.dbService.getVehiclesTable(),
      Item: vehicle
    }));

    return vehicle;
  }

  async findAll(): Promise<Vehicle[]> {
    const db = this.dbService.getDb();
    const res = await db.send(new ScanCommand({
      TableName: this.dbService.getVehiclesTable()
    }));

    return (res.Items || []) as Vehicle[];
  }

  async updateStatus(vehicleId: string, req: UpdateVehicleStatus): Promise<Vehicle | null> {
    const db = this.dbService.getDb();
    const vehicle = await db.send(new GetCommand({
      TableName: this.dbService.getVehiclesTable(),
      Key: {vehicleId}
    }));

    if (!vehicle.Item) return null;

    await db.send(new UpdateCommand({
      TableName: this.dbService.getVehiclesTable(),
      Key: {vehicleId},
      UpdateExpression: 'SET vehicle_status = :vehicle_status',
      ExpressionAttributeValues: {':vehicle_status': req.vehicle_status}
    }));

    return {...vehicle.Item as Vehicle, vehicle_status: req.vehicle_status}
  }
}