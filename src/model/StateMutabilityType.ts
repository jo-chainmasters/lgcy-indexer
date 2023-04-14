export enum StateMutabilityType {
  UnknownMutabilityType = 0,
  Pure = 1,
  View = 2,
  Nonpayable = 3,
  Payable = 4,
  UNRECOGNIZED = -1,
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace StateMutabilityType {
  export function valueOf(str: string) {
    return StateMutabilityType[str as keyof typeof StateMutabilityType];
  }
}
