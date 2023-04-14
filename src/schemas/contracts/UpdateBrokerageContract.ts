import { Prop, Schema } from '@nestjs/mongoose';
import { TransactionValue } from '../Transaction';

@Schema()
export class UpdateBrokerageContract extends TransactionValue {
  @Prop()
  brokerage: number;
}
