import bigDecimal = require('js-big-decimal');

export interface AccountProjection {
  address: string;
  firstSeenAtDate: Date;
  firtSeenAtBlock: number;
  usdlBalance: bigDecimal;
  assets: { symbol: string; value: bigDecimal }[];
}
