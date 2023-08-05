export enum ContractType {
  _10 = '_10',
  _20 = '_20',
  _165 = '_165',
  _721 = '_721',
  _1155 = '_1155',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ContractType {
  export function valueOf(str: string): ContractType {
    return ContractType[str as keyof typeof ContractType] as ContractType;
  }
}
