import { TransactionValue } from '../Transaction';
import { ResourceType } from '../ResourceType';

export class UnfreezeBalanceContract extends TransactionValue {
  receiver: string;
  resource: ResourceType;
}
