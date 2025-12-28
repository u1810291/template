import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { EnvironmentConfigService } from '@config/environment-config/environment-config.service';

@Global()
@Module({
  providers: [PrismaService, EnvironmentConfigService],
  exports: [PrismaService],
})
export class PrismaModule {}
