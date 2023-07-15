export enum EntryType {
  UnknownEntryType = 'UnknownEntryType',
  Constructor = 'Constructor',
  Function = 'Function',
  Event = 'Event',
  Fallback = 'Fallback',
  UNRECOGNIZED = 'UNRECOGNIZED',
}

export namespace EntryType {
  export function valueOf(str: string): EntryType {
    return EntryType[str as keyof typeof EntryType] as EntryType;
  }
}
