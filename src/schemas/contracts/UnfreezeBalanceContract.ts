import { Prop, Schema } from '@nestjs/mongoose';
import { ResourceType } from '../enums/ResourceType';
import { TransactionValue } from '../Transaction';

@Schema()
export class UnfreezeBalanceContract extends TransactionValue {
  @Prop()
  receiver: string;
  @Prop({ type: String, enum: ResourceType })
  resource: ResourceType;
}
