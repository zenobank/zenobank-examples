import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { env } from "./lib/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  await app.listen(env.PORT);
  console.log(`Running on port ${env.PORT}`);
}

bootstrap();
