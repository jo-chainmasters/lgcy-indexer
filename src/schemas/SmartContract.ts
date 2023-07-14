import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export class InternalMetaData {
  createdBy: string;
  createdAtBlock: number;
  createdAtDate: Date;
}

export class Abi {
  functions?: SmartContractFunction;
}

export interface SmartContractFunction {
  [key: string]: SmartContractParamData;
}

export interface SmartContractParamData {
  stateMutability: string;
  inputParams?: SmartContractParam;
}

export interface SmartContractParam {
  [key: string]: { type: string; indexed: boolean };
}

export type SmartContractSchema = HydratedDocument<SmartContract>;

@Schema()
export class SmartContract {
  @Prop()
  name: string;
  @Prop()
  address: string;
  @Prop()
  consumeUserResourcePercent: number;

  @Prop({ type: Abi })
  abi?: Abi;

  @Prop({ type: InternalMetaData })
  created: InternalMetaData;
}

export const SmartContractSchema = SchemaFactory.createForClass(SmartContract);
