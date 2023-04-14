import { Prop, Schema } from '@nestjs/mongoose';
import { TransactionValue } from '../../Transaction';
import { Vote } from './Vote';

@Schema()
export class VoteWitnessContract extends TransactionValue {
  @Prop()
  support: boolean;
  @Prop({ type: [Vote], default: [] })
  votes: Vote[];
}
