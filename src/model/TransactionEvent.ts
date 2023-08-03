import { Log } from './TransactionInfo/Log';
import { SmartContract } from './SmartContract';
import e from 'express';
import bigDecimal = require('js-big-decimal');

export class TransactionEvent {
  contractAddress: string;
  name: string;
  indexed: { [key: string]: string }[] = [];
  value: EventValue;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EventValue {}

export interface _20TransferEventValue extends EventValue {
  amount: bigDecimal;
}

export interface _20ApprovalEvent extends EventValue {
  amount: bigDecimal;
}
