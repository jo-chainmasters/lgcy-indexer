import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class ParserInfo {
  @Prop()
  transactionInfo: boolean;
}
