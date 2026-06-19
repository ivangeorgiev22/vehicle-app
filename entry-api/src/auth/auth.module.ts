import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ApiClient } from "../core-client/api-client";
import { JwtAuthModule } from "../jwt/jwt.module";

@Module({
  imports: [JwtAuthModule],
  exports: [JwtAuthModule],
  controllers: [AuthController],
  providers: [AuthService, ApiClient],
})
export class AuthModule {}