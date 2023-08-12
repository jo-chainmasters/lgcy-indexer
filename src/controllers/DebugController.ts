import { Controller, Get, Query } from "@nestjs/common";
import { TransactionService } from "../services/transaction.service";

@Controller('debug')
export class DebugController {


  constructor(private transactionService: TransactionService) {
  }

  @Get('transactionPage')
  public async getTransactionList(@Query() query) {
    return await this.transactionService.getTstPage(query);
  }
}