import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
}

export const BlockSchema = SchemaFactory.createForClass(Block);
