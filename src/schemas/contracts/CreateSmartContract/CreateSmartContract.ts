import { Prop, Schema } from '@nestjs/mongoose';
import { TransactionValue } from '../../Transaction';
import { Abi } from './Abi';

@Schema()
export class CreateSmartContract extends TransactionValue {
  @Prop()
  name: string;
  @Prop()
  bytecode: string;
  @Prop()
  consumeUserResourcePercent: number;
  @Prop({ type: Abi })
  abi: Abi;
}
