import { Schema as OrigSchema } from 'mongoose';
import { ResourceType } from '../enums/ResourceType';
import { TransactionValue } from '../Transaction';

export class FreezeBalanceContract extends TransactionValue {
  frozenBalance: OrigSchema.Types.Decimal128;
  frozenDuration: number;
  resource: ResourceType;
  receiver: string;
}
