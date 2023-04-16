import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';

@Controller('transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(private transactionService: TransactionService) {}

  @Get(':address')
  public async getTransactionPage(@Param() params, @Query() query) {
    const transactions = await this.transactionService.getPage(
      params.address,
      query.first,
      query.rows,
      query.sortField,
      query.sortOrder,
    );
    return transactions;
  }
}
