import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "../auth/jwt.strategy";

// this module's job is to only configure jwt and share it 
// so that any other module that needs it can simply import it 
@Module({
  imports: [PassportModule, JwtModule.register({
    secret: process.env.JWT_SECRET_KEY || 'super-super-secret-key',
    signOptions: {expiresIn: '3h'}
  })],
  providers: [JwtStrategy],
  exports: [JwtModule, PassportModule, JwtStrategy]
})
export class JwtAuthModule {}