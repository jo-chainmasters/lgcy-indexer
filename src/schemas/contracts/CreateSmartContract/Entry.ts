import { EntryType } from '../../enums/EntryType';
import { StateMutabilityType } from '../../enums/StateMutabilityType';

import { InOutput } from './InOutput';

export class Entry {
  anonymous: boolean;
  constant: boolean;
  name: string;
  inputs: InOutput[];
  outputs: InOutput[];
  type: EntryType;
  payable: boolean;
  stateMutability: StateMutabilityType;
}
