import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as OrigSchema } from 'mongoose';

@Schema()
export class CallValueInfo {
  // usdl (TBD: or token) value
  @Prop()
  callValue: OrigSchema.Types.Decimal128;
  // TBD: tokenName, usdl should be empty
  @Prop()
  tokenId: string;
}
