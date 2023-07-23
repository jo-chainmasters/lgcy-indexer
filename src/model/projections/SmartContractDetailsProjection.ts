import { SmartContract } from '../SmartContract';

export class SmartContractDetailsProjection {
  contract: SmartContract;
  generalInformations: { [key: string]: string };
  callingOverview: { [key: string]: string };
}
