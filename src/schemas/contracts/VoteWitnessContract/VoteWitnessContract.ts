import { TransactionValue } from '../../Transaction';
import { Vote } from './Vote';

export class VoteWitnessContract extends TransactionValue {
  support: boolean;
  votes: Vote[];
}
