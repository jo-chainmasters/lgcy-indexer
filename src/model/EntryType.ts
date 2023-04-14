export enum EntryType {
  UnknownEntryType = 0,
  Constructor = 1,
  Function = 2,
  Event = 3,
  Fallback = 4,
  UNRECOGNIZED = -1,
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace EntryType {
  export function valueOf(str: string) {
    return EntryType[str as keyof typeof EntryType];
  }
}
