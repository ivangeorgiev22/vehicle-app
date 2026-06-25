import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import ServerlessHttp from "serverless-http";

let handler: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();
  return ServerlessHttp(app.getHttpAdapter().getInstance());
}

export const lambdaHandler = async (event, context) => {
  if(!handler) {
    handler = await bootstrap();
  }
  return handler(event,context);
}