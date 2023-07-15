import { Types } from 'mongoose';
import { TransactionValue } from '../Transaction';

export class TransferAssetContract extends TransactionValue {
  amount: Types.Decimal128;
  assetName: string;
  receiver: string;
}
