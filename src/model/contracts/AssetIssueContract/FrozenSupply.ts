import { Schema as OrigSchema } from 'mongoose';

export class FrozenSupply {
  frozenAmount: OrigSchema.Types.Decimal128;
  frozenDays: OrigSchema.Types.Decimal128;
}
