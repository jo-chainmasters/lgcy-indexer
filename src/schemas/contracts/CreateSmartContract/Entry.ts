import { Prop, Schema } from '@nestjs/mongoose';
import { EntryType } from '../../enums/EntryType';
import { StateMutabilityType } from '../../enums/StateMutabilityType';

import { InOutput } from './InOutput';

@Schema()
export class Entry {
  @Prop()
  anonymous: boolean;
  @Prop()
  constant: boolean;
  @Prop()
  name: string;
  @Prop({ type: [InOutput], defaule: [] })
  inputs: InOutput[];
  @Prop({ type: [InOutput], defaule: [] })
  outputs: InOutput[];
  @Prop({ type: String, enum: EntryType })
  type: EntryType;
  @Prop()
  payable: boolean;
  @Prop({ type: String, enum: StateMutabilityType })
  stateMutability: StateMutabilityType;
}
