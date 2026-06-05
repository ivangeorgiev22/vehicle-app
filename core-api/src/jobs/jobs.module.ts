import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { DatabaseService } from "../database/database.service";
import { JobsController } from "./jobs.controller";

@Module({
  providers: [JobsService, DatabaseService],
  exports: [JobsService],
  controllers: [JobsController]
})
export class JobsModule {}