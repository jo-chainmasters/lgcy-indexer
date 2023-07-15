export enum TransactionSuccessCode {
  SUCESS = 'SUCESS',
  FAILED = 'FAILED',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TransactionSuccessCode {
  export function valueOf(str: string) {
    return TransactionSuccessCode[str as keyof typeof TransactionSuccessCode] as TransactionSuccessCode;
  }
}
