import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class MarketOrderDetails {
  @Prop()
  makerOrderId: string;
  @Prop()
  takerOrderId: string;
  @Prop()
  fillSellQuantity: string;
  @Prop()
  fillBuyQuantity: string;
}
