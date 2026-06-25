import { Module } from "@nestjs/common";
import { MissionsController } from "./missions.controller";
import { MissionsService } from "./missions.service";
import { DatabaseModule } from "../database/database.module";
import { JobsModule } from "../jobs/jobs.module";
import { EmailModule } from "../emails/email.module";

@Module({
  imports: [DatabaseModule, JobsModule, EmailModule],
  providers: [MissionsService],
  controllers: [MissionsController]

})
export class MissionsModule {}