import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { ApiClient } from "../core-client/api-client";
import { JwtAuthModule } from "../jwt/jwt.module";

@Module({
  imports: [JwtAuthModule],
  providers: [JobsService, ApiClient],
  controllers: [JobsController]
})
export class JobsModule {}