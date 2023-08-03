import { Injectable, Logger } from '@nestjs/common';
import { ContractCall } from '../model/ContractCall';
import { Transaction } from '../model/Transaction';
import { LgcyService } from './lgcy.service';
import { SmartContractService } from './SmartContractService';
import { TriggerSmartContract } from '../model/contracts/TriggerSmartContract';

@Injectable()
export class ContractCallService {
  private readonly logger = new Logger(ContractCallService.name);

  constructor(
    private lgcyService: LgcyService,
    private contractService: SmartContractService,
  ) {}

  public async createContractCall(transaction: Transaction) {
    const contract = await this.contractService.findByAddress(
      (transaction.transactionValue as TriggerSmartContract).contractAddress,
    );

    if (contract === null) {
      return null;
    }
    const callData = await this.lgcyService.getContractCallData(
      contract,
      transaction,
    );

    const contractCall: ContractCall = {
      functionName: (callData as any).name,
      paramValues: (callData as any).params,
    };

    return contractCall;
  }
}
