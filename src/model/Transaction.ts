import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as OrigSchema } from 'mongoose';
import { TransactionType } from './TransactionType';
import { TransactionInfo } from './TransactionInfo/TransactionInfo';
import { ParserInfo } from './ParserInfo';

export type TransactionSchema = HydratedDocument<Transaction>;

export class TransactionValue {}

@Schema()
export class Transaction {
  @Prop()
  hash: string;
  @Prop()
  blockNumber: number;
  @Prop()
  timestamp: Date;
  @Prop({ type: String, enum: TransactionType })
  type: TransactionType;
  @Prop()
  sender: string;
  @Prop()
  memo: string;
  @Prop()
  successfull: boolean;
  @Prop()
  receiver?: string;
  @Prop()
  amount?: OrigSchema.Types.Decimal128;

  @Prop({ type: ParserInfo })
  parserInfo?: ParserInfo;

  @Prop()
  fee?: number;

  @Prop({ type: TransactionValue })
  transactionValue?: TransactionValue;
  @Prop({ type: TransactionInfo })
  transactionInfo?: TransactionInfo;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
