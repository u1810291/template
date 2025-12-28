import { Module } from '@nestjs/common';
import { PrismaModule } from '@config/prisma/prisma.module';
import { PrismaService } from '@config/prisma/prisma.service';

import { BcryptService } from '@infrastructure/services/bcrypt/bcrypt.service';
import { PrismaRepository } from '@infrastructure/repositories/prisma.repository';
import { DatabaseUserRepository } from '@infrastructure/repositories/user.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    BcryptService,
    DatabaseUserRepository,
    PrismaRepository,
    {
      provide: 'UserRepository',
      inject: [PrismaService],
      useFactory: (prismaService: PrismaService) =>
        new PrismaRepository(prismaService, 'users'),
    },
    {
      provide: 'TransactionRepository',
      inject: [PrismaService],
      useFactory: (prismaService: PrismaService) =>
        new PrismaRepository(prismaService, 'transaction'),
    },
  ],
  exports: [DatabaseUserRepository, PrismaRepository],
})
export class RepositoriesModule {}
