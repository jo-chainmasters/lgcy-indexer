import { ContractResult } from '../enums/ContractResult';

export class ResourceReceipt {
  kandyUsage: number;
  kandyFee: number;
  originKandyUsage: number;
  kandyUsageTotal: number;
  netUsage: number;
  netFee: number;
  result: ContractResult;
}
