import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  //starts the app using AppModule as the root config
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
