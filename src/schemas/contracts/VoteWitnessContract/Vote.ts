import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Vote {
  @Prop()
  voteAddress: string;
  @Prop()
  voteCount: number;
}
