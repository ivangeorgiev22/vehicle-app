import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MissionsModule } from './missions/missions.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [AuthModule, ConfigModule.forRoot(), MissionsModule],
})
export class AppModule {}
