export enum ResourceType {
  BANDWIDTH = 0x00,
  USDL_POWER = 0x01,
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ResourceType {
  export function valueOf(str: string) {
    return ResourceType[str as keyof typeof ResourceType];
  }
}
