import { Prop, Schema } from '@nestjs/mongoose';
import { TransactionSuccessCode } from '../enums/TransactionSuccessCode';
import { Schema as OrigSchema } from 'mongoose';
import { ResourceReceipt } from './ResourceReceipt';
import { InternalTransaction } from './InternalTransaction';
import { Log } from './Log';
import { MarketOrderDetails } from './MarketOrderDetails';

@Schema()
export class TransactionInfo {
  @Prop({ type: [String], default: undefined })
  contractResult?: string[];

  @Prop()
  contractAddress: string;

  @Prop({ type: ResourceReceipt })
  resourceReceipt?: ResourceReceipt;
  @Prop([Log])
  logs?: Log[];
  @Prop({ type: String, enum: TransactionSuccessCode })
  successCode: TransactionSuccessCode;
  @Prop()
  resMessage: string;
  @Prop()
  assetIssueID: string;
  @Prop()
  withdrawAmount: OrigSchema.Types.Decimal128;
  @Prop()
  unfreezeAmount: OrigSchema.Types.Decimal128;
  @Prop([InternalTransaction])
  internalTransactions?: InternalTransaction[];
  @Prop()
  exchangeReceivedAmount: OrigSchema.Types.Decimal128;
  @Prop()
  exchangeInjectAnotherAmount: OrigSchema.Types.Decimal128;
  @Prop()
  exchangeWithdrawAnotherAmount: OrigSchema.Types.Decimal128;
  @Prop()
  exchangeId: number;
  @Prop()
  shieldedTransactionFee: number;
  @Prop()
  orderId: string;
  @Prop({ type: MarketOrderDetails })
  orderDetails?: MarketOrderDetails;
}
