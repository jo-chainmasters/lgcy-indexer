import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionService } from '../services/transaction.service';
import { SmartContractService } from '../services/SmartContractService';
import { SmartContract } from '../model/SmartContract';
import { TransactionEvent } from '../model/TransactionEvent';
import { TransactionEventService } from '../services/TransactionEventService';

@Injectable()
export class TransactionEventParser {
  private readonly logger = new Logger(TransactionEventParser.name);

  private contracts: { [key: string]: SmartContract } = {};

  constructor(
    private transactionService: TransactionService,
    private smartContractService: SmartContractService,
    private transactionEventService: TransactionEventService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  public async eventParser() {
    const transactions = await this.transactionService.findWithoutEventParser();
    if (transactions.length > 0)
      this.logger.debug('Found ' + transactions.length + ' to parse Events');

    for (const transaction of transactions) {
      const logs = transaction.transactionInfo.logs;
      const events = [];
      for (const log of logs) {
        let contract = this.contracts[log.address];
        if (!contract) {
          contract = await this.smartContractService.findByAddress(log.address);
        }
        if (contract) {
          this.contracts[log.address] = contract;
          const event = this.transactionEventService.fromLog(log, contract);
          events.push(event);
          await this.transactionService.setEvents(transaction, events);
          await this.transactionService.setParserInfo(
            transaction,
            'event',
            true,
          );
        }
      }
    }
  }
}
