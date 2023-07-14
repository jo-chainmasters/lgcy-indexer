import { TransactionValue } from '../../Transaction';
import { Abi } from './Abi';

export class CreateSmartContract extends TransactionValue {
  name: string;
  bytecode: string;
  consumeUserResourcePercent: number;
  abi: Abi;
}
