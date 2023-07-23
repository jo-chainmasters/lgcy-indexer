import { Transaction } from './Transaction';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type AccountSchema = HydratedDocument<Account>;

@Schema()
export class Account {
  @Prop()
  address: string;
  @Prop()
  firstSeenAtDate: Date;
  @Prop()
  firstSeenAtBlock: number;
  @Prop()
  usdlBalance: Types.Decimal128;
  transactions?: Transaction[];
}

export const AccountSchema = SchemaFactory.createForClass(Account);
