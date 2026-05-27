import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { UsersModule } from "../users/user.module";

//connects feature modules together
@Module({
  imports: [DatabaseModule, UsersModule]
})
export class AppModule {}