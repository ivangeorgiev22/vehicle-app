import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { UsersModule } from "./users/user.module";
import { MissionsModule } from "./missions/missions.module";
import { ConfigModule } from "@nestjs/config";
import { VehiclesModule } from "./vehicles/vehicles.module";


@Module({
  imports: [DatabaseModule, UsersModule, MissionsModule, ConfigModule.forRoot(), VehiclesModule]
})
export class AppModule {}