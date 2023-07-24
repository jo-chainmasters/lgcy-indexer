import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContractCall } from '../model/ContractCall';
import { Transaction } from '../model/Transaction';
import { LgcyService } from './lgcy.service';
import { TriggerSmartContract } from '../model/contracts/TriggerSmartContract';
import { Account } from '../model/Account';
import bigDecimal from 'js-big-decimal';

@Injectable()
export class ContractCallService {
  private readonly logger = new Logger(ContractCallService.name);

  constructor(
    @InjectModel(ContractCall.name)
    private readonly contractCallModel: Model<ContractCall>,
    private lgcyService: LgcyService,
  ) {}

  public async createContractCall(transaction: Transaction) {
    const callData = await this.lgcyService.getContractCallData(transaction);
    const paramNames: string[] = [];
    const paramValues: any[] = [];
    const paramTypes: string[] = [];
    if ((callData as any).params) {
      for (const paramsKey in (callData as any).params as {
        [key: string]: any;
      }) {
        paramNames.push(paramsKey);
        paramValues.push((callData as any).params[paramsKey]);
      }
    }
    if ((callData as any).abi?.inputs) {
      for (const input of (callData as any).abi.inputs) {
        paramTypes.push(input.type);
      }
    }
    const contractCall: ContractCall = {
      transactionHash: transaction.hash,
      blockNumber: transaction.blockNumber,
      contractAddress: (transaction.transactionValue as TriggerSmartContract)
        .contractAddress,
      sender: transaction.sender,
      functionSelector: (callData as any).functionSelector,
      functionName: (callData as any).name,
      paramNames: paramNames.length > 0 ? paramNames : undefined,
      paramValues: paramValues.length > 0 ? paramValues : undefined,
      paramTypes: paramTypes.length > 0 ? paramTypes : undefined,
    };

    for (let i = 0; i < paramValues.length; i++) {
      const v = paramValues[i];
      const t = paramTypes[i];

      if (t === 'address') {
        paramValues[i] = this.lgcyService.hexToBase58(v);
      }
      if (t === 'uint256') {
        paramValues[i] = (paramValues[i] as bigDecimal).getValue();
      }

      if (t === 'uint256[]') {
        for (let j = 0; j < (paramValues[i] as []).length; j++) {
          const paramValueElement = (paramValues[i] as [])[j];
          paramValues[i][j] = (paramValueElement as bigDecimal).getValue();
        }
      }
    }
    return contractCall;
  }

  public async save(contractCall: ContractCall) {
    return this.contractCallModel.findOneAndUpdate(
      { transactionHash: contractCall.transactionHash },
      contractCall,
      {
        upsert: true,
      },
    );
  }
}
