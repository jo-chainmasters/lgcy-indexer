import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionService } from '../services/transaction.service';
import { SmartContractService } from '../services/SmartContractService';
import { SmartContract } from '../schemas/SmartContract';

@Injectable()
export class SmartContractParserService {
  private readonly logger = new Logger(SmartContractParserService.name);

  constructor(
    private transactionService: TransactionService,
    private smartContractService: SmartContractService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  public async searchCreateCreateSmartContract() {
    const createSmartContractTransactions =
      await this.transactionService.findWithoutCreateSmartContractAnalyzing();
    if (createSmartContractTransactions.length > 0) {
      this.logger.log(
        'Found ' +
          createSmartContractTransactions.length +
          ' CreateSmartContract to analyze',
      );
    }

    for (const transaction of createSmartContractTransactions) {
      const smartContract =
        SmartContractService.createSmartContract(transaction);
      await this.smartContractService.insertAll([smartContract]);
      await this.transactionService.setParserInfo(
        transaction,
        'smartContractRecorded',
        true,
      );
    }
  }
}
