import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Abi as OrigAbi } from './contracts/CreateSmartContract/Abi';
import { ContractType } from "./ContractType";
import { TransactionType } from "./TransactionType";
export class InternalMetaData {
  createdBy: string;
  createdAtBlock: number;
  createdAtDate: Date;
}

export class Abi {
  functions?: SmartContractFunction;
  events?: SmartContractFunction;
}

export interface SmartContractFunction {
  [key: string]: SmartContractParamData;
}

export interface SmartContractParamData {
  name?: string;
  functionSelector?: string;
  functionSignature?: string;
  stateMutability?: string;
  inputParams?: { type: string; name: string; indexed: boolean }[];
  outputParams?: { type: string; indexed: boolean }[];
}

export interface SmartContractParam {
  [key: string]: { type: string; indexed: boolean };
}

export type SmartContractSchema = HydratedDocument<SmartContract>;

@Schema()
export class SmartContract {
  @Prop({ type: [{ type: String, enum: ContractType, default: undefined }] })
  types?: ContractType[];
  @Prop()
  name: string;
  @Prop()
  address: string;
  @Prop()
  consumeUserResourcePercent: number;

  @Prop({ type: Abi })
  parsedAbi?: Abi;

  @Prop({ type: OrigAbi })
  abi?: OrigAbi;

  @Prop({ type: InternalMetaData })
  created: InternalMetaData;
}

export const SmartContractSchema = SchemaFactory.createForClass(SmartContract);
