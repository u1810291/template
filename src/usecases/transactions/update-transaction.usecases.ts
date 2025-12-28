import { Transaction } from '@prisma/client';
import { ILogger } from '@domain/logger/logger.interface';
import { TransactionRepositoryI } from '@domain/repositories/transaction-repository.interface';

import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service';

export class UpdateTransactionUseCases {
  constructor(
    private readonly logger: ILogger,
    private readonly transactionRepository: TransactionRepositoryI,
    private readonly exceptionService: ExceptionsService,
  ) {}

  async execute(id: string, data: Transaction): Promise<string | null> {
    const transaction = await this.transactionRepository.getTransaction(id);

    if (!transaction) {
      this.exceptionService.NotFoundException();
    }
    const result = await this.transactionRepository.updateTransaction(id, data);
    this.logger.log(
      'UpdateTransactionUseCases execute',
      'Transaction has been updated',
    );
    return result;
  }
}
