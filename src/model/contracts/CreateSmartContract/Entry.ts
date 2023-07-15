import { EntryType } from '../../EntryType';
import { StateMutabilityType } from '../../StateMutabilityType';

import { InOutput } from './InOutput';

export class Entry {
  anonymous: boolean;
  constant: boolean;
  name: string;
  inputs?: InOutput[];
  outputs?: InOutput[];
  type: EntryType;
  payable: boolean;
  stateMutability: StateMutabilityType;
}
