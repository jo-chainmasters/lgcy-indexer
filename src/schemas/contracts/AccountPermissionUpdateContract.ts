import { Permission } from './common/Permission';
import { TransactionValue } from '../Transaction';

export class AccountPermissionUpdateContract extends TransactionValue {
  owner: Permission;
  witness: Permission;
  actives: Permission[];
}
