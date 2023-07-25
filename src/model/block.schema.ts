import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ParserInfo } from "./ParserInfo";

export type BlockSchema = HydratedDocument<Block>;

@Schema()
export class Block {
  @Prop()
  hash: string;
  @Prop()
  parentHash: string;
  @Prop()
  number: number;
  @Prop()
  timestamp: Date;
  @Prop({ type: ParserInfo })
  parserInfo?: ParserInfo;
}

export const BlockSchema = SchemaFactory.createForClass(Block);
