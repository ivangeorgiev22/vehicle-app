import { Module } from '@nestjs/common';
import { MissionsModule } from './missions/missions.module';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './jobs/jobs.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';


@Module({
  imports: [ConfigModule.forRoot(), MissionsModule, JobsModule, UsersModule, VehiclesModule],
})
export class AppModule {}
