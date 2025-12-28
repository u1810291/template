import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EnvironmentConfigService } from '@config/environment-config/environment-config.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(environmentConfig: EnvironmentConfigService) {
    const url = environmentConfig.getDatabaseUrl();
    super({
      datasources: {
        db: { url },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  enableShutdownHooks(): void {
    process.on('beforeExit', () => {
      void this.$disconnect().then(() => {
        console.log('Disconnected from database');
      });
    });
  }
}
