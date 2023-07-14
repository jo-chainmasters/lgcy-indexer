import { Prop, Schema } from '@nestjs/mongoose';
import { TransactionSuccessCode } from '../enums/TransactionSuccessCode';
import { Schema as OrigSchema } from 'mongoose';
import { ResourceReceipt } from './ResourceReceipt';
import { InternalTransaction } from './InternalTransaction';
import { Log } from './Log';
import { MarketOrderDetails } from './MarketOrderDetails';

export class TransactionInfo {
  contractResult?: string[];
  contractAddress: string;
  resourceReceipt?: ResourceReceipt;
  logs?: Log[];
  successCode: TransactionSuccessCode;
  resMessage: string;
  assetIssueID: string;
  withdrawAmount: OrigSchema.Types.Decimal128;
  unfreezeAmount: OrigSchema.Types.Decimal128;
  internalTransactions?: InternalTransaction[];
  exchangeReceivedAmount: OrigSchema.Types.Decimal128;
  exchangeInjectAnotherAmount: OrigSchema.Types.Decimal128;
  exchangeWithdrawAnotherAmount: OrigSchema.Types.Decimal128;
  exchangeId: number;
  shieldedTransactionFee: number;
  orderId: string;
  orderDetails?: MarketOrderDetails;
}
