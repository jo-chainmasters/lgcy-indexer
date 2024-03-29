import { Controller, Get, Param, Query } from '@nestjs/common';
import { AccountService } from '../services/AccountService';
import { LgcyService } from '../services/lgcy.service';
import { TokenService } from '../services/TokenService';
import { ContractType } from '../model/ContractType';
import bigDecimal = require('js-big-decimal');

@Controller()
export class AccountController {
  constructor(
    private accountService: AccountService,
    private lgcyService: LgcyService,
    private tokenService: TokenService,
  ) {}

  @Get('account/:address')
  public async getAccount(@Param() params) {
    const account = await this.accountService.getAccount(params.address);
    const accountChain = await this.accountService.getAccountFromChain(
      params.address,
    );
    const tokens = await this.tokenService.findAll();
    const assets = [];
    for (const token of tokens) {
      if (token.type === ContractType._20) {
        const result = await this.lgcyService.callContract(
          token.tokenId,
          'balanceOf',
          [account.address],
        );
        let powStr = '1';
        for (let i = 0; i <= token.decimals - 1; i++) {
          powStr += '0';
        }

        const pow = new bigDecimal(powStr);
        const value = new bigDecimal(result).divide(
          pow,
          bigDecimal.RoundingModes.HALF_DOWN,
        );
        if (value.compareTo(new bigDecimal(0)) > 0) {
          assets.push({
            symbol: token.symbol,
            value: value.getValue(),
          });
        }
      }
      if (token.type === ContractType._10) {
        if (account.tokenBalances && account.tokenBalances[token.tokenId]) {
          const t = account.tokenBalances[token.tokenId];
          if (t) {
            let tokenPow = new bigDecimal(1);
            for (let i = 0; i <= token.decimals - 1; i++) {
              tokenPow = tokenPow.multiply(new bigDecimal(10));
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            let tVal = new bigDecimal(t.value);
            tVal = tVal.divide(tokenPow, token.decimals);
            assets.push({ symbol: token.symbol, value: tVal.getValue() });
          }
        }
      }
    }

    return this.accountService.createAccountProjection(
      account,
      accountChain,
      assets,
    );
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
