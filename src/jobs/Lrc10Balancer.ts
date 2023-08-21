import { Injectable, Logger } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { TokenService } from '../services/TokenService';
import { Cron, CronExpression } from '@nestjs/schedule';
import bigDecimal = require('js-big-decimal');
import { AccountService } from '../services/AccountService';
import { TransferAssetContract } from '../model/contracts/TransferAssetContract';

@Injectable()
export class Lrc10Balancer {
  private readonly logger = new Logger(Lrc10Balancer.name);

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private tokenService: TokenService,
  ) {
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  public async checkForLrc10() {
    const transactions =
      await this.transactionService.findWithoutLrc10Balanced();
    if (transactions.length > 0) {
      this.logger.debug(
        'Found ' + transactions.length + ' TransferAssetContract to analyze',
      );
    }

    for (const transaction of transactions) {
      const assetTransfer =
        transaction.transactionValue as TransferAssetContract;
      const tokenId = assetTransfer.assetName;
      const sender = transaction.sender;
      const receiver = assetTransfer.receiver;
      const amountStr = assetTransfer.amount.toString();
      const amount = new bigDecimal(amountStr);

      await this.accountService.calcLrcTransfer(
        sender,
        receiver,
        tokenId,
        amount,
        transaction.blockNumber,
        transaction.timestamp,
      );
      await this.transactionService.setParserInfo(
        transaction,
        'lrc10Balanced',
        true,
      );
    }
  }
}
