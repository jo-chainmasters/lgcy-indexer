import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TransactionService } from '../services/transaction.service';
import { LgcyService } from '../services/lgcy.service';
import { ContractCallService } from '../services/ContractCallService';

@Injectable()
export class DebugJobService {
  private readonly logger = new Logger(DebugJobService.name);

  constructor(
    private transactionService: TransactionService,
    private configService: ConfigService,
    private lgcyService: LgcyService,
    private contractCallService: ContractCallService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  public async debug() {
    // const transaction = await this.transactionService.findByHash(
    //   '22b0b98e6f2d3bf0f829a6ed75882443d68dbda7aad4a7132020f6f3e573ec6a',
    // );
    //
    // if (transaction) {
    //   const contractCall = await this.contractCallService.createContractCall(
    //     transaction,
    //   );
    //   console.log(contractCall);
    // }
  }
}
