import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@config/prisma/prisma.service';

export const prismaInit = (app: INestApplication) => {
  const prisma = app.get<PrismaService>(PrismaService);
  void prisma.enableShutdownHooks();
};
