import { Injectable, Logger } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { Cron, CronExpression } from '@nestjs/schedule';

import { TransactionType } from '../model/TransactionType';

@Injectable()
export class TransactionInfoSyncerService {
  private readonly logger = new Logger(TransactionService.name);
  constructor(private transactionService: TransactionService) {}

  @Cron(CronExpression.EVERY_SECOND)
  public async syncTransactionInfo() {
    const transactions =
      await this.transactionService.findWithoutTransactionInfo();

    if (transactions.length > 0)
      this.logger.debug(
        'Found ' + transactions.length + ' to fetch TransactionInfo',
      );

    // this.logger.debug(transactions);
    for (const transaction of transactions) {
      const txInfo = await this.transactionService.getTransactionInfoFromChain(
        transaction,
      );
      // this.logger.debug(txInfo);
      if (transaction.type !== TransactionType.TransferContract)
        transaction.transactionInfo = txInfo;

      await this.transactionService.setParserInfo(
        transaction,
        'transactionInfo',
        true,
      );
    }
    await this.transactionService.updateAll(transactions);
  }
}
