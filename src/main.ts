import { setDefaultResultOrder } from "dns";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

setDefaultResultOrder("ipv4first");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN?.trim();
  const origin = corsOrigin
    ? corsOrigin
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : true;

  app.enableCors({
    origin,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix("api/v1");

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("Presti API")
    .setDescription("API de gestión de préstamos y motor de reglas crediticias")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Aplicación corriendo en: http://localhost:${port}/api/v1`);
  console.log(`Swagger UI en:           http://localhost:${port}/api/docs`);
}

bootstrap();
