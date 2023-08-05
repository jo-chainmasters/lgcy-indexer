import { Controller, Get, Param, Query } from '@nestjs/common';
import { TokenService } from '../services/TokenService';

@Controller('tokens')
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Get('page')
  public async getTokensPage(@Param() params, @Query() query) {
    const tokens = await this.tokenService.getPage(
      Number(query.first),
      Number(query.rows),
      query.sortField,
      Number(query.sortOrder),
    );
    return tokens;
  }
}
