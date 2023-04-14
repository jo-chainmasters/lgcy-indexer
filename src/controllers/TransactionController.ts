import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';

@Controller('transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private transactionService: TransactionService) {}

  @Get(':address')
  public async getTransactionPage(@Param() params, @Query() query) {
    this.logger.debug(
      'transactions.controller: params: ' +
        JSON.stringify(params) +
        ' query: ' +
        JSON.stringify(query),
    );
    const transactions = await this.transactionService.getPage(
      params.address,
      query.first,
      query.rows,
    );
    return transactions;
  }
}
