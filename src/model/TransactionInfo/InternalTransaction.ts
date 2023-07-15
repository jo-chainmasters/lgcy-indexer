
import { CallValueInfo } from './CallValueInfo';

export class InternalTransaction {
  // internalTransaction identity, the root InternalTransaction hash
  // should equals to root transaction id.
  hash: string;
  // the one send usdl (TBD: or token) via function
  callerAddress: string;
  // the one recieve usdl (TBD: or token) via function
  transferToAddress: string;
  note: string;
  rejected: boolean;
  callValueInfo?: CallValueInfo[];
}
