import { Prop, Schema } from '@nestjs/mongoose';
import { PermissionType } from '../../enums/PermissionType';

import { Key } from './Key';

@Schema()
export class Permission {
  @Prop({ type: String, enum: PermissionType })
  type: PermissionType;
  @Prop()
  id: number;
  @Prop()
  permissionName: string;
  @Prop()
  threshold: number;
  @Prop()
  parentId: number;
  @Prop()
  operations: string;
  @Prop({ type: [Key], default: [] })
  keys: Key[];
}
