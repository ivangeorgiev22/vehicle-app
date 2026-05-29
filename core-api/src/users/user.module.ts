import { Module } from "@nestjs/common";
import { UsersController } from "./user.controller";
import { UsersService } from "./users.service";
import { DatabaseModule } from "../database/database.module";

//group everything related to users
@Module({
    imports: [DatabaseModule],
    controllers: [UsersController],
    providers: [UsersService]
})
export class UsersModule {}