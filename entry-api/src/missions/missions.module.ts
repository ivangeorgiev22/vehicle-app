import { Module } from "@nestjs/common";
import { MissionsController } from "./missions.controller";
import { MissionsService } from "./missions.service";
import { ApiClient } from "../core-client/api-client";
import { JwtAuthModule } from "../jwt/jwt.module";

@Module ({
  imports: [JwtAuthModule],
  providers: [MissionsService, ApiClient],
  controllers: [MissionsController]
})
export class MissionsModule {}