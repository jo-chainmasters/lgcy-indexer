import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as OrigSchema } from 'mongoose';

@Schema()
export class FrozenSupply {
  @Prop()
  frozenAmount: OrigSchema.Types.Decimal128;
  @Prop()
  frozenDays: OrigSchema.Types.Decimal128;
}
