import bigDecimal = require('js-big-decimal');
import { Schema } from 'mongoose';

export class NumberConverter {
  public static decimal128ToBigDecimal(
    input: Schema.Types.Decimal128,
  ): bigDecimal {
    if (!input) {
      return undefined;
    }

    return new bigDecimal(input.toString());
  }
}
