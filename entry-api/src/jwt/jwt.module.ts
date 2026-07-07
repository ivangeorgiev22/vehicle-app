import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "../auth/jwt.strategy";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [PassportModule, ConfigModule, JwtModule.register({})],
  providers: [JwtStrategy],
  exports: [JwtModule, PassportModule, JwtStrategy]
})
export class JwtAuthModule {}