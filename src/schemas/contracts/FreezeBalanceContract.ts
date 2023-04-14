import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as OrigSchema } from 'mongoose';
import { ResourceType } from '../enums/ResourceType';
import { TransactionValue } from '../Transaction';

@Schema()
export class FreezeBalanceContract extends TransactionValue {
  @Prop()
  frozenBalance: OrigSchema.Types.Decimal128;
  @Prop()
  frozenDuration: number;
  @Prop({ type: String, enum: ResourceType })
  resource: ResourceType;
  @Prop()
  receiver: string;
}
