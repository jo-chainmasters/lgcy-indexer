import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as OrigSchema } from 'mongoose';
import { TransactionValue } from '../Transaction';

@Schema()
export class TriggerSmartContract extends TransactionValue {
  @Prop()
  contractAddress: string;
  @Prop()
  callValue: OrigSchema.Types.Decimal128;
  @Prop()
  data: string;
  @Prop()
  callTokenValue: OrigSchema.Types.Decimal128;
  @Prop()
  tokenId: number;
}
