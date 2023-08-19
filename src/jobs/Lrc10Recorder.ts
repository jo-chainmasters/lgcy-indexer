import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionService } from '../services/transaction.service';
import { TokenService } from '../services/TokenService';

@Injectable()
export class Lrc10Recorder {
  private readonly logger = new Logger(Lrc10Recorder.name);

  constructor(
    private transactionService: TransactionService,
    private tokenService: TokenService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  public async checkForLrc10() {
    const transactions =
      await this.transactionService.findWithoutLrc10Recorded();
    if (transactions.length > 0) {
      this.logger.debug(
        'Found ' + transactions.length + ' AssetIssueContract to analyze',
      );
    }

    for (const transaction of transactions) {
      const token = this.tokenService.createLrc10Token(transaction);
      await this.tokenService.save(token);
      await this.transactionService.setParserInfo(
        transaction,
        'lrc10Recorded',
        true,
      );
    }
  }
}
