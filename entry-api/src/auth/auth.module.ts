import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ApiClient } from "../core-client/api-client";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  // jwt global config for this module
  imports: [PassportModule,JwtModule.register({
    secret: 'super-super-secret-key',
    signOptions: {
      expiresIn: '3h'
    },
  })],
  controllers: [AuthController],
  providers: [AuthService, ApiClient, JwtStrategy],
})
export class AuthModule {}