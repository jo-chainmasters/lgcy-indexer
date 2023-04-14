import { Prop, Schema } from '@nestjs/mongoose';
import { TransactionValue } from '../Transaction';

@Schema()
export class ProposalCreateContract extends TransactionValue {
  @Prop({ type: Map, of: Number })
  parameters: Map<number, number>;
}
