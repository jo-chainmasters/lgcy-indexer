import { Schema as OrigSchema } from 'mongoose';
import { TransactionValue } from '../Transaction';
import { ResourceType } from '../ResourceType';

export class FreezeBalanceContract extends TransactionValue {
  frozenBalance: OrigSchema.Types.Decimal128;
  frozenDuration: number;
  resource: ResourceType;
  receiver: string;
}
