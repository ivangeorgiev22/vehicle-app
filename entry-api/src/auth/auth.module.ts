import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ApiClient } from "../core-client/api-client";

@Module({
  // jwt global config for this module
  imports: [JwtModule.register({
    secret: 'super-super-secret-key',
    signOptions: {
      expiresIn: '3h'
    },
  })],
  controllers: [AuthController],
  providers: [AuthService, ApiClient],
})
export class AuthModule {}