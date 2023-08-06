import { Transaction } from './Transaction';
import { HydratedDocument, Types } from "mongoose";
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as OrigSchema} from 'mongoose';

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
  usdlBalance: OrigSchema.Types.Decimal128;
  transactions?: Transaction[];
}

export const AccountSchema = SchemaFactory.createForClass(Account);
