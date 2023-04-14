import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as OrigSchema } from 'mongoose';
import { TransactionValue } from '../../Transaction';
import { FrozenSupply } from './FrozenSupply';

@Schema()
export class AssetIssueContract extends TransactionValue {
  @Prop()
  id: string;
  @Prop()
  name: string;
  @Prop()
  abbr: string;
  @Prop()
  totalSupply: OrigSchema.Types.Decimal128;
  @Prop({ type: FrozenSupply })
  frozenSupply: FrozenSupply;
  @Prop()
  usdlNum: number;
  @Prop()
  precision: number;
  @Prop()
  num: number;
  @Prop()
  startTime: number;
  @Prop()
  endTime: number;
  @Prop()
  order: number;
  @Prop()
  voteScore: number;
  @Prop()
  description: string;
  @Prop()
  url: string;
  @Prop()
  freeAssetNetLimit: number;
  @Prop()
  publicFreeAssetNetLimit: number;
  @Prop()
  publicFreeAssetNetUsage: number;
  @Prop()
  publicLatestFreeNetTime: number;
}
