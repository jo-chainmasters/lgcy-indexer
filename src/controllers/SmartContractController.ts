import { Controller, Get, Param, Query } from '@nestjs/common';
import { SmartContractService } from '../services/SmartContractService';

@Controller('smartContracts')
export class SmartContractController {
  constructor(private smartContractService: SmartContractService) {}

  @Get('page')
  public async getSmartContractPage(@Param() params, @Query() query) {
    const smartContracts = await this.smartContractService.getPage(
      query.first,
      query.rows,
      query.sortField,
      query.sortOrder,
    );
    return smartContracts;
  }
}
