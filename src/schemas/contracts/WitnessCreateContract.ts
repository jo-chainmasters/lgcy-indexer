import { Prop, Schema } from '@nestjs/mongoose';
import { TransactionValue } from '../Transaction';

@Schema()
export class WitnessCreateContract extends TransactionValue {
  @Prop()
  url: string;
}
