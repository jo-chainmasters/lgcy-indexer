export enum PermissionType {
  Owner = 'Owner',
  Witness = 'Witness',
  Active = 'Active',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PermissionType {
  export function valueOf(str: string) {
    return PermissionType[str as keyof typeof PermissionType];
  }
}
