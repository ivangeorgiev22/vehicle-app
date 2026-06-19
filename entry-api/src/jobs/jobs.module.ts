import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { ApiClient } from "../core-client/api-client";
import { JwtAuthModule } from "../jwt/jwt.module";
import { JobsGateway } from "./jobs.gateway";

@Module({
  imports: [JwtAuthModule],
  providers: [JobsService, ApiClient, JobsGateway],
  controllers: [JobsController],
  exports: [JobsGateway]
})
export class JobsModule {}