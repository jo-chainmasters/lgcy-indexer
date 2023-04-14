import { Prop, Schema } from '@nestjs/mongoose';

import { CallValueInfo } from './CallValueInfo';

@Schema()
export class InternalTransaction {
  // internalTransaction identity, the root InternalTransaction hash
  // should equals to root transaction id.
  @Prop()
  hash: string;
  // the one send usdl (TBD: or token) via function
  @Prop()
  callerAddress: string;
  // the one recieve usdl (TBD: or token) via function
  @Prop()
  transferToAddress: string;
  @Prop()
  note: string;
  @Prop()
  rejected: boolean;
  @Prop([CallValueInfo])
  callValueInfo?: CallValueInfo[];
}
