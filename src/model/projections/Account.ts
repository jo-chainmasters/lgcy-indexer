import { Transaction } from '../../schemas/Transaction';

export class Account {
  constructor(public transactions: Transaction[]) {}
}
