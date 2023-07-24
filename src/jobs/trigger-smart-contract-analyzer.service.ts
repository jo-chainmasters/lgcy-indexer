import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionService } from '../services/transaction.service';
import { ContractCallService } from '../services/ContractCallService';
import { SmartContractService } from '../services/SmartContractService';
import { ContractCall } from '../model/ContractCall';

@Injectable()
export class TriggerSmartContractAnalyzer {
  private readonly logger = new Logger(TriggerSmartContractAnalyzer.name);

  constructor(
    private transactionService: TransactionService,
    private contractCallService: ContractCallService,
  ) {}

  // @Cron(CronExpression.EVERY_SECOND)
  public async analayzeSmartContract() {
    const transactions =
      await this.transactionService.findWithoutTriggerSmartContactAnalayzing();
    if (transactions.length > 0) {
      this.logger.log(
        'Found ' + transactions.length + ' TriggerSmartContract to analyze',
      );
    }

    for (const transaction of transactions) {
      const contractCall = await this.contractCallService.createContractCall(
        transaction,
      );
      await this.contractCallService.save(contractCall as ContractCall);
      await this.transactionService.setParserInfo(
        transaction,
        'triggerSmartContractRecorded',
        true,
      );
    }
  }
}
