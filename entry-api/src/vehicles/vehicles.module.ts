import { Module } from "@nestjs/common";
import { VehiclesService } from "./vehicles.service";
import { VehiclesController } from "./vehicles.controller";
import { ApiClient } from "../core-client/api-client";
import { JwtAuthModule } from "../jwt/jwt.module";

@Module({
  providers: [VehiclesService, ApiClient],
  controllers: [VehiclesController],
  imports: [JwtAuthModule]
})
export class VehiclesModule {}