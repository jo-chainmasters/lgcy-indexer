export enum ContractResult {
  DEFAULT = 'DEFAULT',
  SUCCESS = 'SUCCESS',
  REVERT = 'REVERT',
  BAD_JUMP_DESTINATION = 'BAD_JUMP_DESTINATION',
  OUT_OF_MEMORY = 'OUT_OF_MEMORY',
  PRECOMPILED_CONTRACT = 'PRECOMPILED_CONTRACT',
  STACK_TOO_SMALL = 'STACK_TOO_SMALL',
  STACK_TOO_LARGE = 'STACK_TOO_LARGE',
  ILLEGAL_OPERATION = 'ILLEGAL_OPERATION',
  STACK_OVERFLOW = 'STACK_OVERFLOW',
  OUT_OF_USDL = 'OUT_OF_USDL',
  OUT_OF_TIME = 'OUT_OF_TIME',
  JVM_STACK_OVER_FLOW = 'JVM_STACK_OVER_FLOW',
  UNKNOWN = 'UNKNOWN',
  TRANSFER_FAILED = 'TRANSFER_FAILED',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ContractResult {
  export function valueOf(str: string) {
    return ContractResult[str as keyof typeof ContractResult];
  }
}
