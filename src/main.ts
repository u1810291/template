import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { prismaInit } from '@config/prisma/prisma.config';

import { ValidatorConfig } from '@infrastructure/config';
import { LoggerService } from '@infrastructure/logger/logger.service';
import { AllExceptionFilter } from '@infrastructure/common/filter/exception.filter';
import { LoggingInterceptor } from '@infrastructure/common/interceptors/logger.interceptor';
import {
  ResponseFormat,
  ResponseInterceptor,
} from '@infrastructure/common/interceptors/response.interceptor';

async function bootstrap() {
  const env = process.env.NODE_ENV;
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors();

  // Filter
  app.useGlobalFilters(new AllExceptionFilter(new LoggerService()));

  // pipes
  app.useGlobalPipes(new ValidationPipe(ValidatorConfig));

  // interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(new LoggerService()));
  app.useGlobalInterceptors(new ResponseInterceptor());

  // base routing
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  // swagger config
  if (env !== 'production') {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('Clean Architecture Nestjs')
      .setDescription('Example template')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config, {
      extraModels: [ResponseFormat],
      deepScanRoutes: true,
    });
    SwaggerModule.setup('api', app, document);
  }
  prismaInit(app);
  await app.listen(8080);
}
void bootstrap();
