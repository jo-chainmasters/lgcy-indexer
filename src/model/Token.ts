import { ContractType } from './ContractType';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TokenSchema = HydratedDocument<Token>;

@Schema()
export class Token {
  @Prop({ type: String, enum: ContractType })
  public type: ContractType;
  @Prop()
  public name: string;
  @Prop()
  public description: string;
  @Prop()
  public url: string;
  @Prop()
  public tokenId: string;
  @Prop()
  public symbol: string;
  @Prop()
  public decimals: number;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
