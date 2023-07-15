import { Key } from './Key';
import { PermissionType } from '../../PermissionType';

export class Permission {
  type: PermissionType;
  id: number;
  permissionName: string;
  threshold: number;
  parentId: number;
  operations: string;
  keys: Key[];
}
