import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';

@Controller('transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(private transactionService: TransactionService) {}

  @Get('byAddress/:address')
  public async getTransactionPageByAddress(@Param() params, @Query() query) {
    const transactions = await this.transactionService.getPageByAddress(
      params.address,
      query.first,
      query.rows,
      query.sortField,
      query.sortOrder,
    );
    return transactions;
  }

  @Get('page')
  public async getTransactionPage(@Param() params, @Query() query) {
    return await this.transactionService.getPage(
      query.first,
      query.rows,
      query.sortField,
      query.sortOrder,
    );
  }

  @Get('byHash/:hash')
  public async getTransaction(@Param() params) {
    return await this.transactionService.findByHash(params.hash);
  }
}
