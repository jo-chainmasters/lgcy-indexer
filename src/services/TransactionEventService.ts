import { Injectable } from '@nestjs/common';
import { Log } from '../model/TransactionInfo/Log';
import { SmartContract } from '../model/SmartContract';
import {
  _20ApprovalEvent,
  _20TransferEventValue,
  TransactionEvent
} from "../model/TransactionEvent";
import { LgcyService } from './lgcy.service';
import { ContractType } from '../model/ContractType';
import bigDecimal = require('js-big-decimal');

@Injectable()
export class TransactionEventService {
  constructor(private lgcyService: LgcyService) {}

  public fromLog(log: Log, smartContract: SmartContract): TransactionEvent {
    const event = new TransactionEvent();
    const e = smartContract.parsedAbi.events[log.topics[0]];
    event.name = e.name;
    if (e.inputParams) {
      for (let i = 0; i < e.inputParams.length; i++) {
        const inputParam = e.inputParams[i];
        if (!inputParam.indexed) {
          continue;
        }
        let val: string | undefined = undefined;
        switch (true) {
          case /^address$/.test(inputParam.type):
            val = this.lgcyService.hexToBase58(
              log.topics[i + 1].replace('000000000000000000000000', '30'),
            );
            break;

          case /^uint.*/.test(inputParam.type):
            const tmp = BigInt('0x' + log.topics[i + 1]);
            val = new bigDecimal(tmp).getValue();
            break;
          default:
            val = log.topics[i + 1];
            break;
        }
        event.indexed.push({ name: inputParam.name, value: val });
      }
    }

    event.contractAddress = log.address;

    if (smartContract.types.includes(ContractType._20)) {
      switch (event.name) {
        case 'Transfer':
          (event.value as _20TransferEventValue) = {
            amount: new bigDecimal(BigInt('0x' + log.data)),
          };
          break;
        case 'Approval':
          (event.value as _20ApprovalEvent) = {
            amount: new bigDecimal(BigInt('0x' + log.data)),
          };
          break;
      }
    }

    return event;
  }
}
