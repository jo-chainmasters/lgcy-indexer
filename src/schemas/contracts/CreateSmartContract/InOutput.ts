import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class InOutput {
  @Prop()
  indexed: boolean;
  @Prop()
  name: string;
  @Prop()
  type: string;
}
