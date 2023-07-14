import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as OrigSchema } from 'mongoose';
import { TransactionValue } from '../Transaction';

export class TriggerSmartContract extends TransactionValue {
  contractAddress: string;
  callValue: OrigSchema.Types.Decimal128;
  data: string;
  callTokenValue: OrigSchema.Types.Decimal128;
  tokenId: number;
}
