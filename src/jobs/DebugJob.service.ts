import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionService } from '../services/transaction.service';

@Injectable()
export class DebugJobService {
  private readonly logger = new Logger(DebugJobService.name);

  constructor(private transactionService: TransactionService) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  public async debug() {
    const transaction = await this.transactionService.findByHash(
      '76593ba61465b8c0ce4295691fa26d46630b5de8862f1bf6a7a7f1f9442c837e',
    );

    this.logger.debug('bla');
  }
}
