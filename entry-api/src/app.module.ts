import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

// load authentication into the app
@Module({
  imports: [AuthModule],
})
export class AppModule {}
