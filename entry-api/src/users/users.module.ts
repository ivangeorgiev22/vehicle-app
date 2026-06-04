import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { ApiClient } from "../core-client/api-client";
import { JwtAuthModule } from "../jwt/jwt.module";

@Module({
  providers: [UsersService, ApiClient],
  controllers: [UsersController],
  imports: [JwtAuthModule]
})
export class UsersModule {}