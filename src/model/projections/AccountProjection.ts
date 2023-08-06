import bigDecimal = require('js-big-decimal');

export interface AccountProjection {
  address: string;
  name?: string;
  firstSeenAtDate: Date;
  firstSeenAtBlock: number;
  usdlAvailable: bigDecimal;
  usdlFrozen: bigDecimal;
  usdlTotal: bigDecimal;
  assets: { symbol: string; value: bigDecimal }[];
}
