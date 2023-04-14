import { Prop, Schema } from '@nestjs/mongoose';
import { TransactionValue } from '../Transaction';

@Schema()
export class AccountUpdateContract extends TransactionValue {
  @Prop()
  accountName: string;
}
