import { Transaction } from '@prisma/client';
import { PrismaRepositoryI } from './prisma-repository.interface';

export type CreateTransactionI = Pick<
  Transaction,
  'amount' | 'type' | 'status' | 'categoryId'
>;

export interface TransactionRepositoryI
  extends PrismaRepositoryI<'transaction'> {
  getTransaction(id: string): Promise<Transaction | null>;
  createTransaction(data: Transaction): Promise<CreateTransactionI | null>;
  deleteTransaction(data: string): Promise<Pick<Transaction, 'id'>>;
  updateTransaction(id: string, data: Transaction): Promise<string | null>;
  getAllTransactions(options: Record<string, number>): Promise<Transaction[]>;
}
