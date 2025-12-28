import { PrismaClient } from '@prisma/client';

export interface PrismaRepositoryI<
  K extends Exclude<keyof PrismaClient, symbol | `$${string}`>,
> {
  aggregate(
    ...args: Parameters<PrismaClient[K]['aggregate']>
  ): ReturnType<PrismaClient[K]['aggregate']>;

  count(
    ...args: Parameters<PrismaClient[K]['count']>
  ): ReturnType<PrismaClient[K]['count']>;

  create(
    ...args: Parameters<PrismaClient[K]['create']>
  ): ReturnType<PrismaClient[K]['create']>;

  delete(
    ...args: Parameters<PrismaClient[K]['delete']>
  ): ReturnType<PrismaClient[K]['delete']>;

  update(
    ...args: Parameters<PrismaClient[K]['update']>
  ): ReturnType<PrismaClient[K]['update']>;

  upsert(
    ...args: Parameters<PrismaClient[K]['upsert']>
  ): ReturnType<PrismaClient[K]['upsert']>;

  findMany(
    ...args: Parameters<PrismaClient[K]['findMany']>
  ): ReturnType<PrismaClient[K]['findMany']>;

  findFirst(
    ...args: Parameters<PrismaClient[K]['findFirst']>
  ): ReturnType<PrismaClient[K]['findFirst']>;

  createMany(
    ...args: Parameters<PrismaClient[K]['createMany']>
  ): ReturnType<PrismaClient[K]['createMany']>;

  findUnique(
    ...args: Parameters<PrismaClient[K]['findUnique']>
  ): ReturnType<PrismaClient[K]['findUnique']>;

  updateMany(
    ...args: Parameters<PrismaClient[K]['updateMany']>
  ): ReturnType<PrismaClient[K]['updateMany']>;

  findFirstOrThrow(
    ...args: Parameters<PrismaClient[K]['findFirstOrThrow']>
  ): ReturnType<PrismaClient[K]['findFirstOrThrow']>;

  findUniqueOrThrow(
    ...args: Parameters<PrismaClient[K]['findUniqueOrThrow']>
  ): ReturnType<PrismaClient[K]['findUniqueOrThrow']>;
}
