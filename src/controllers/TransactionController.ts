import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import bigDecimal from 'js-big-decimal';
import { filter } from 'rxjs';

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
    const filters = {};
    for (const key of Object.keys(query)) {
      const paramValue = query[key] as string;
      if (key.startsWith('filter.')) {
        const paramKey = key.substring(7);
        const filterMode = paramKey.substring(0, paramKey.indexOf('.'));
        const filterField = paramKey.substring(filterMode.length + 1);
        filters[filterField] = {
          matchMode: filterMode,
          value: paramValue,
        };
      }
    }

    return await this.transactionService.getPage(
      query.first,
      query.rows,
      query.sortField,
      query.sortOrder,
      Object.keys(filters).length > 0 ? filters : undefined
    );
  }

  @Get('byHash/:hash')
  public async getTransaction(@Param() params) {
    const transaction = await this.transactionService.findByHash(params.hash);
    return this.transactionService.mapTransactionForHttpResponse(transaction);
  }
}
