import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "../auth/jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [PassportModule, ConfigModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get('JWT_SECRET_KEY') || 'super-super-secret-key',
      signOptions: {
        expiresIn: configService.get('TOKEN_EXPIRY') || '1hr'
      }
    })
  })],
  providers: [JwtStrategy],
  exports: [JwtModule, PassportModule, JwtStrategy]
})
export class JwtAuthModule {}