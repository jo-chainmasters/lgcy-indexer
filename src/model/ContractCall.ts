import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContractCallSchema = HydratedDocument<ContractCall>;

@Schema()
export class ContractCall {
  @Prop()
  transactionHash: string;
  @Prop()
  blockNumber: number;
  @Prop()
  sender: string;
  @Prop()
  contractAddress: string;
  @Prop()
  functionSelector?: string;
  @Prop()
  functionName?: string;
  @Prop([String])
  paramNames?: string[];
  @Prop([String])
  paramTypes?: string[];
  @Prop([String])
  paramValues?: string[];
}

export const ContractCallSchema = SchemaFactory.createForClass(ContractCall);
