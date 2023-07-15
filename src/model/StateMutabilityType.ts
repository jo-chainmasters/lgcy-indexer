export enum StateMutabilityType {
  UnknownMutabilityType = 'UnknownMutabilityType',
  Pure = 'Pure',
  View = 'View',
  Nonpayable = 'Nonpayable',
  Payable = 'Payable',
  UNRECOGNIZED = 'UNRECOGNIZED',
}

export namespace StateMutabilityType {
  export function valueOf(str: string): StateMutabilityType {
    return StateMutabilityType[
      str as keyof typeof StateMutabilityType
    ] as StateMutabilityType;
  }
}
