import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Log {
  @Prop()
  address: string;
  @Prop({ type: [String] })
  topics: string[];
  @Prop()
  data: string;
}
