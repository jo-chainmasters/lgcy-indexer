import { Schema as OrigSchema } from 'mongoose';
import { TransactionValue } from '../../Transaction';
import { FrozenSupply } from './FrozenSupply';

export class AssetIssueContract extends TransactionValue {
  id: string;
  name: string;
  abbr: string;
  totalSupply: OrigSchema.Types.Decimal128;
  frozenSupply: FrozenSupply;
  usdlNum: number;
  precision: number;
  num: number;
  startTime: number;
  endTime: number;
  order: number;
  voteScore: number;
  description: string;
  url: string;
  freeAssetNetLimit: number;
  publicFreeAssetNetLimit: number;
  publicFreeAssetNetUsage: number;
  publicLatestFreeNetTime: number;
}
