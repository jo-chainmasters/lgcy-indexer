import { Controller, Get, Param } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';

@Controller('account')
export class AccountController {
  constructor(private transactionService: TransactionService) {}

  @Get(':address')
  public async getAccount(@Param() params) {
    const transactions = await this.transactionService.findByAddress(
      params.address,
    );
    return { transactions };
  }
}
