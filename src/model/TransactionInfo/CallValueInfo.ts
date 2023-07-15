import { Schema as OrigSchema } from 'mongoose';

export class CallValueInfo {
  // usdl (TBD: or token) value
  callValue: OrigSchema.Types.Decimal128;
  // TBD: tokenName, usdl should be empty
  tokenId: string;
}
