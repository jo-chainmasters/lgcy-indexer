import { Prop, Schema } from '@nestjs/mongoose';
import { ContractResult } from '../enums/ContractResult';

@Schema()
export class ResourceReceipt {
  @Prop()
  kandyUsage: number;
  @Prop()
  kandyFee: number;
  @Prop()
  originKandyUsage: number;
  @Prop()
  kandyUsageTotal: number;
  @Prop()
  netUsage: number;
  @Prop()
  netFee: number;
  @Prop({ type: String, enum: ContractResult })
  result: ContractResult;
}
