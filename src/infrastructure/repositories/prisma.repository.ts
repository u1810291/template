import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@config/prisma/prisma.service';
import { PrismaRepositoryI } from '@domain/repositories/prisma-repository.interface';

export class PrismaRepository<
  K extends Exclude<keyof PrismaClient, symbol | `$${string}`>,
> implements PrismaRepositoryI<K>
{
  constructor(
    protected readonly prisma: PrismaService,
    private readonly model: K,
  ) {}

  aggregate(...args: Parameters<PrismaClient[K]['aggregate']>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (this.prisma[this.model].aggregate as any)(...args);
  }

  count(...args: Parameters<PrismaClient[K]['count']>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (this.prisma[this.model].count as any)(...args);
  }

  create(...args: Parameters<PrismaClient[K]['create']>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (this.prisma[this.model].create as any)(...args);
  }

  createMany(...args: Parameters<PrismaClient[K]['createMany']>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (this.prisma[this.model].createMany as any)(...args);
  }

  delete(...args: Parameters<PrismaClient[K]['delete']>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (this.prisma[this.model].delete as any)(...args);
  }

  findFirst(...args: Parameters<PrismaClient[K]['findFirst']>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (this.prisma[this.model].findFirst as any)(...args);
  }

  findFirstOrThrow(...args: Parameters<PrismaClient[K]['findFirstOrThrow']>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (this.prisma.users.findFirstOrThrow as any)(...args);
  }

  findMany(...args: Parameters<PrismaClient[K]['findMany']>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (this.prisma[this.model].findMany as any)(...args);
  }

  findUnique(...args: Parameters<PrismaClient[K]['findUnique']>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (this.prisma[this.model].findUnique as any)(...args);
  }

  findUniqueOrThrow(...args: Parameters<PrismaClient[K]['findUniqueOrThrow']>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (this.prisma[this.model].findUniqueOrThrow as any)(...args);
  }

  update(...args: Parameters<PrismaClient[K]['update']>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (this.prisma[this.model].update as any)(...args);
  }

  updateMany(...args: Parameters<PrismaClient[K]['updateMany']>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (this.prisma[this.model].updateMany as any)(...args);
  }

  upsert(...args: Parameters<PrismaClient[K]['upsert']>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return (this.prisma[this.model].upsert as any)(...args);
  }
}
