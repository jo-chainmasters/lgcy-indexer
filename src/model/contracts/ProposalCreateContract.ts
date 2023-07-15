import { TransactionValue } from '../Transaction';

export class ProposalCreateContract extends TransactionValue {
  parameters: Map<number, number>;
}
