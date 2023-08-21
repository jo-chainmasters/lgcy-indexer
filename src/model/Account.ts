import { Transaction } from './Transaction';
import { HydratedDocument, Types } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as OrigSchema } from 'mongoose';
import bigDecimal = require('js-big-decimal');

export type AccountSchema = HydratedDocument<Account>;
export class TokenBalances {
  public map: { [key: string]: bigDecimal };
}

@Schema()
export class Account {
  @Prop()
  address: string;
  @Prop()
  firstSeenAtDate: Date;
  @Prop()
  firstSeenAtBlock: number;
  @Prop()
  usdlBalance?: OrigSchema.Types.Decimal128;
  transactions?: Transaction[];
  @Prop({ type: TokenBalances })
  tokenBalances?: { [key: string]: bigDecimal };
}

export const AccountSchema = SchemaFactory.createForClass(Account);
