import { Transaction } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@config/prisma/prisma.service';

import { PrismaRepository } from '@infrastructure/repositories/prisma.repository';
import { TransactionRepositoryI } from '@domain/repositories/transaction-repository.interface';

@Injectable()
export class DatabaseTransactionRepository
  extends PrismaRepository<'transaction'>
  implements TransactionRepositoryI
{
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, 'transaction');
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.findFirst({
      where: {
        id: id,
      },
    });
  }

  async updateTransaction(
    id: string,
    data: Transaction,
  ): Promise<string | null> {
    const result = await this.prisma.transaction.update({
      where: {
        id,
      },
      data: data,
    });
    return result.id;
  }

  async createTransaction(data: Transaction): Promise<Transaction | null> {
    return this.prisma.transaction.create({ data });
  }

  async getAllTransactions(
    options: Record<string, number>,
  ): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      skip: (options.pageNumber - 1) * options.itemsPerPage,
      take: options.itemsPerPage,
      orderBy: {
        [options.orderBy]: options.orderDirection,
      },
    });
  }

  async deleteTransaction(id: string): Promise<Pick<Transaction, 'id'>> {
    return this.prisma.transaction.delete({
      where: {
        id: id,
      },
    });
  }
}
