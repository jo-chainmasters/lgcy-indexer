import { Prop, Schema } from '@nestjs/mongoose';
import { Permission } from './common/Permission';
import { TransactionValue } from '../Transaction';

@Schema()
export class AccountPermissionUpdateContract extends TransactionValue {
  @Prop({ type: Permission })
  owner: Permission;
  witness: Permission;
  actives: Permission[];
}
