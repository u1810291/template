/* eslint-disable @typescript-eslint/unbound-method */

import { CreateTransactionUsecase } from './create-transaction.usecases';
import { ILogger } from '@domain/logger/logger.interface';
import {
  TransactionRepositoryI,
  CreateTransactionI,
} from '@domain/repositories/transaction-repository.interface';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('CreateTransactionUsecase', () => {
  let createTransactionUsecase: CreateTransactionUsecase;
  let mockLogger: jest.Mocked<ILogger>;
  let mockTransactionRepository: jest.Mocked<TransactionRepositoryI>;

  const createMockTransaction = (
    overrides?: Partial<Transaction>,
  ): Transaction => ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    amount: new Decimal(100.5),
    type: TransactionType.income,
    date: new Date('2024-01-01'),
    status: TransactionStatus.active,
    categoryId: 'category-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  });

  const createMockTransactionResult = (
    overrides?: Partial<CreateTransactionI>,
  ): CreateTransactionI => ({
    amount: new Decimal(100.5),
    type: TransactionType.income,
    status: TransactionStatus.active,
    categoryId: 'category-123',
    ...overrides,
  });

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as jest.Mocked<ILogger>;

    mockTransactionRepository = {
      createTransaction: jest.fn(),
      getTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
      updateTransaction: jest.fn(),
      getAllTransactions: jest.fn(),
    } as unknown as jest.Mocked<TransactionRepositoryI>;

    createTransactionUsecase = new CreateTransactionUsecase(
      mockLogger,
      mockTransactionRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully create a transaction and log the action', async () => {
      // Arrange
      const transactionData = createMockTransaction();
      const expectedResult = createMockTransactionResult();

      mockTransactionRepository.createTransaction.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await createTransactionUsecase.execute(transactionData);

      // Assert
      expect(mockTransactionRepository.createTransaction).toHaveBeenCalledWith(
        transactionData,
      );
      expect(mockTransactionRepository.createTransaction).toHaveBeenCalledTimes(
        1,
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'CreateTransactionUseCases execute',
        'New transaction has been inserted',
      );
      expect(result).toEqual(expectedResult);
    });

    it('should create income transaction with correct data', async () => {
      // Arrange
      const incomeTransaction = createMockTransaction({
        type: TransactionType.income,
        amount: new Decimal(500),
      });
      const expectedResult = createMockTransactionResult({
        type: TransactionType.income,
        amount: new Decimal(500),
      });

      mockTransactionRepository.createTransaction.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await createTransactionUsecase.execute(incomeTransaction);

      // Assert
      expect(result?.type).toBe(TransactionType.income);
      expect(result?.amount).toEqual(new Decimal(500));
    });

    it('should create expense transaction with correct data', async () => {
      // Arrange
      const expenseTransaction = createMockTransaction({
        type: TransactionType.expense,
        amount: new Decimal(250.75),
      });
      const expectedResult = createMockTransactionResult({
        type: TransactionType.expense,
        amount: new Decimal(250.75),
      });

      mockTransactionRepository.createTransaction.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await createTransactionUsecase.execute(expenseTransaction);

      // Assert
      expect(result?.type).toBe(TransactionType.expense);
      expect(result?.amount).toEqual(new Decimal(250.75));
    });

    it('should handle pending status transactions', async () => {
      // Arrange
      const pendingTransaction = createMockTransaction({
        status: TransactionStatus.pending,
      });
      const expectedResult = createMockTransactionResult({
        status: TransactionStatus.pending,
      });

      mockTransactionRepository.createTransaction.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await createTransactionUsecase.execute(pendingTransaction);

      // Assert
      expect(result?.status).toBe(TransactionStatus.pending);
    });

    it('should handle inactive status transactions', async () => {
      // Arrange
      const inactiveTransaction = createMockTransaction({
        status: TransactionStatus.inactive,
      });
      const expectedResult = createMockTransactionResult({
        status: TransactionStatus.inactive,
      });

      mockTransactionRepository.createTransaction.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result =
        await createTransactionUsecase.execute(inactiveTransaction);

      // Assert
      expect(result?.status).toBe(TransactionStatus.inactive);
    });

    it('should return null when repository returns null', async () => {
      // Arrange
      const transactionData = createMockTransaction();
      mockTransactionRepository.createTransaction.mockResolvedValue(null);

      // Act
      const result = await createTransactionUsecase.execute(transactionData);

      // Assert
      expect(result).toBeNull();
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should pass exact transaction data to repository', async () => {
      // Arrange
      const specificTransaction = createMockTransaction({
        amount: new Decimal(999.99),
        categoryId: 'specific-category-id',
        type: TransactionType.expense,
      });

      mockTransactionRepository.createTransaction.mockResolvedValue(
        createMockTransactionResult(),
      );

      // Act
      await createTransactionUsecase.execute(specificTransaction);

      // Assert
      expect(mockTransactionRepository.createTransaction).toHaveBeenCalledWith(
        specificTransaction,
      );
      const callArg =
        mockTransactionRepository.createTransaction.mock.calls[0][0];
      expect(callArg.amount).toEqual(new Decimal(999.99));
      expect(callArg.categoryId).toBe('specific-category-id');
      expect(callArg.type).toBe(TransactionType.expense);
    });

    it('should log after repository operation completes', async () => {
      // Arrange
      const transactionData = createMockTransaction();
      mockTransactionRepository.createTransaction.mockResolvedValue(
        createMockTransactionResult(),
      );

      // Act
      await createTransactionUsecase.execute(transactionData);

      // Assert
      expect(mockTransactionRepository.createTransaction).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalled();
    });
  });
});
