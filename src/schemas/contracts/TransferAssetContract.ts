import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { TransactionValue } from '../Transaction';

@Schema()
export class TransferAssetContract extends TransactionValue {
  @Prop()
  amount: Types.Decimal128;
  @Prop()
  assetName: string;
  @Prop()
  receiver: string;
}
