import { Controller, Get, Param, Query } from "@nestjs/common";
import { AccountService } from '../services/AccountService';

@Controller()
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get('account/:address')
  public async getAccount(@Param() params) {
    return await this.accountService.getAccount(params.address);
  }

  @Get('accounts/page')
  public async getToplist(@Param() params, @Query() query) {
    return await this.accountService.getPage(
      query.first,
      query.rows,
      query.sortField,
      query.sortOrder,
    );
  }
}
