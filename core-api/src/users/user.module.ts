import { Module } from "@nestjs/common";
import { UsersController } from "./user.controller";
import { DatabaseModule } from "../database/database.module";
import { UsersImageService } from "./users-image.service";

//group everything related to users
@Module({
    imports: [DatabaseModule],
    controllers: [UsersController],
    providers: [UsersImageService]
})
export class UsersModule {}