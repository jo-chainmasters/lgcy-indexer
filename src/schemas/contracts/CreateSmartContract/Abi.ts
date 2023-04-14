import { Prop, Schema } from '@nestjs/mongoose';
import { Entry } from './Entry';

@Schema()
export class Abi {
  @Prop({ type: [Entry], default: [] })
  entries: Entry[];
}
