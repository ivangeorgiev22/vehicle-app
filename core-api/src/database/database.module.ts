import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
// Module's job is to make the database service available to the app
@Module({
  providers: [DatabaseService], //provider is the injectable class managed by Nest 
  exports: [DatabaseService] // allows other modules to use database service
})
export class DatabaseModule {}