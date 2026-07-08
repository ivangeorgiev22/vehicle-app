import { Module } from "@nestjs/common";
import { VehiclesService } from "./vehicles.service";
import { VehiclesController } from "./vehicles.controller";
import { DatabaseModule } from "../database/database.module";

@Module({
  providers: [VehiclesService],
  imports: [DatabaseModule],
  controllers: [VehiclesController],
  exports: [VehiclesService]
})
export class VehiclesModule {}