import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MissionsModule } from './missions/missions.module';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './jobs/jobs.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';


@Module({
  imports: [AuthModule, ConfigModule.forRoot(), MissionsModule, JobsModule, UsersModule, VehiclesModule],
})
export class AppModule {}
