import { SmartContract } from '../SmartContract';

export class SmartContractDetailsProjection {
  contract: SmartContract;
  generalInformations: { [key: string]: string };
  callingData: {
    data: KeyValue;
    topMethods: KeyValue;
    topAddresses: KeyValue;
  };
}

export interface KeyValue {
  [key: string]: string;
}
