import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Key {
  @Prop()
  address: string;
  @Prop()
  weight: number;
}
