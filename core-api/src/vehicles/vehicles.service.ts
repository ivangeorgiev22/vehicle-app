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
    const id = randomUUID();
    const vehicle: Vehicle = {
      id,
      plate: req.plate,
      battery: req.battery,
      vehicleStatus: 'Available'
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

  async updateStatus(id: string, req: UpdateVehicleStatus): Promise<Vehicle | null> {
    const db = this.dbService.getDb();
    const vehicle = await db.send(new GetCommand({
      TableName: this.dbService.getVehiclesTable(),
      Key: {id}
    }));

    if (!vehicle.Item) return null;

    await db.send(new UpdateCommand({
      TableName: this.dbService.getVehiclesTable(),
      Key: {id},
      UpdateExpression: 'SET vehicleStatus = :vehicleStatus',
      ExpressionAttributeValues: {':vehicleStatus': req.vehicleStatus}
    }));

    return {...vehicle.Item as Vehicle, vehicleStatus: req.vehicleStatus}
  }
}