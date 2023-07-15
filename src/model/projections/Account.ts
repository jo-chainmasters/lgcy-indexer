import { Transaction } from '../Transaction';

export class Account {
  constructor(public transactions: Transaction[]) {}
}
