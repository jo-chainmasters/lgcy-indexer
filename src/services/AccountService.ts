import { Injectable, Logger } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { BlockService } from './block.service';
import { Account } from '../model/projections/Account';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(private transactionService: TransactionService) {}

  public async getAccountProjection(address: string) {
    const transactions = await this.transactionService.findByAddress(address);

    return new Account(transactions);
  }
}
