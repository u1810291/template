import { Transaction } from '@prisma/client';
import { ILogger } from '@domain/logger/logger.interface';
import { TransactionRepositoryI } from '@domain/repositories/transaction-repository.interface';
import { ExceptionsService } from '@infrastructure/exceptions/exceptions.service';

export class DeleteTransactionUseCases {
  constructor(
    private readonly logger: ILogger,
    private readonly transactionRepository: TransactionRepositoryI,
    private readonly exceptionService: ExceptionsService,
  ) {}

  async execute(data: Transaction): Promise<Transaction | null> {
    const isTransactionExists = await this.transactionRepository.getTransaction(
      data.id,
    );

    if (!isTransactionExists) {
      this.exceptionService.NotFoundException();
    }
    await this.transactionRepository.deleteTransaction(data.id);

    this.logger.log(
      'DeleteTransactionUseCases execute',
      'Transaction has been deleted',
    );
    return null;
  }
}
