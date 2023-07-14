import { ResourceType } from '../enums/ResourceType';
import { TransactionValue } from '../Transaction';

export class UnfreezeBalanceContract extends TransactionValue {
  receiver: string;
  resource: ResourceType;
}
