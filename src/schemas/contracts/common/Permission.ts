import { PermissionType } from '../../enums/PermissionType';
import { Key } from './Key';

export class Permission {
  type: PermissionType;
  id: number;
  permissionName: string;
  threshold: number;
  parentId: number;
  operations: string;
  keys: Key[];
}
