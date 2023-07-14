import { Controller, Get, Param } from '@nestjs/common';
import { AccountService } from '../services/AccountService';

@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get(':address')
  public async getAccount(@Param() params) {
    return await this.accountService.getAccountProjection(params.address);
  }
}
