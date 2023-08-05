import { Injectable, Logger } from '@nestjs/common';
import { SmartContractService } from '../services/SmartContractService';
import { TokenService } from '../services/TokenService';
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class TokenRecorder {
  private readonly logger = new Logger(TokenRecorder.name);

  constructor(
    private smartContractService: SmartContractService,
    private tokenService: TokenService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  public async checkForContracts() {
    const contracts = await this.smartContractService.getNotRecorded();
    if (contracts.length > 0) {
      this.logger.debug(
        'Found ' + contracts.length + ' Smart Contracts to record',
      );
    }

    for (const contract of contracts) {
      const token = await this.tokenService.createToken(contract);
      await this.tokenService.save(token);
      await this.smartContractService.setRecorded(contract);
    }
  }
}
