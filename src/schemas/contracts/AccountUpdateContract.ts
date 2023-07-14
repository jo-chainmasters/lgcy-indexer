import { TransactionValue } from '../Transaction';

export class AccountUpdateContract extends TransactionValue {
  accountName: string;
}
