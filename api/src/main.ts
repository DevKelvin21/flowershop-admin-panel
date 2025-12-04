import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.setGlobalPrefix('api');

  // Global validation pipe with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 422,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('FlowerShop Transaction Management API v1')
    .setDescription('API for FlowerShop Transaction Management - Version 1')
    .setVersion('1.0')
    .addTag('Health', 'API health check endpoints')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🚀 Swagger is running on: http://localhost:${port}/api/docs`);
}
bootstrap();
