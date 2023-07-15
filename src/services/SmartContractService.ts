import { Injectable, Logger } from '@nestjs/common';
import { Transaction } from '../model/Transaction';
import { SmartContract } from '../model/SmartContract';
import { CreateSmartContract } from '../model/contracts/CreateSmartContract/CreateSmartContract';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntryType } from '../model/EntryType';
import e from "express";

@Injectable()
export class SmartContractService {
  private readonly logger = new Logger(SmartContractService.name);
  constructor(
    @InjectModel(SmartContract.name)
    private readonly smartContractModel: Model<SmartContract>,
  ) {}

  public async insertAll(smartContracts: SmartContract[]) {
    await this.smartContractModel.insertMany(smartContracts);
  }

  public static createSmartContract(transaction: Transaction): SmartContract {
    const createSmartContractValue =
      transaction.transactionValue as CreateSmartContract;

    const smartContract: SmartContract = {
      name: createSmartContractValue.name,
      address: transaction.transactionInfo.contractAddress,
      consumeUserResourcePercent:
        createSmartContractValue.consumeUserResourcePercent,
      created: {
        createdBy: transaction.sender,
        createdAtBlock: transaction.blockNumber,
        createdAtDate: transaction.timestamp,
      },
    };

    if (createSmartContractValue.abi?.entrys) {
      smartContract.abi = {
        functions: {},
        events: {},
      };
      for (const entry of (transaction.transactionValue as CreateSmartContract)
        .abi.entrys) {
        switch (entry.type) {
          case EntryType.Function:
            smartContract.abi.functions[entry.name] = {
              stateMutability: entry.stateMutability.toString(),
            };

            if (entry.inputs) {
              smartContract.abi.functions[entry.name].inputParams = {};

              for (let i = 0; i < entry.inputs.length; i++) {
                const input = entry.inputs[i];

                if (
                  smartContract.abi.functions[entry.name].inputParams[
                    input.name
                  ]
                ) {
                  // this.logger.error(
                  //   'Duplicate inputParam on ' +
                  //     smartContract.name +
                  //     '.' +
                  //     entry.name,
                  // );
                }

                smartContract.abi.functions[entry.name].inputParams[
                  input.name
                ] = { type: input.type, indexed: input.indexed };
              }
            }
            if (entry.outputs) {
              smartContract.abi.functions[entry.name].outputParams = [];

              for (const output of entry.outputs) {
                smartContract.abi.functions[entry.name].outputParams.push({
                  type: output.type,
                  indexed: output.indexed,
                });
              }
            }
            break;
          case EntryType.Event:
            smartContract.abi.events[entry.name] = {};
            if (entry.inputs) {
              smartContract.abi.events[entry.name].inputParams = {};
              for (const input of entry.inputs) {
                smartContract.abi.events[entry.name].inputParams[input.name] = {
                  type: input.type,
                  indexed: input.indexed,
                };
              }
            }
            break;
        }
      }
    }

    return smartContract;
  }

  public async getPage(
    skip: number,
    pageSize: number,
    sortField: string,
    sortOrder: number,
  ) {
    const totalRecords = await this.smartContractModel.count().exec();

    const sort = {};
    sort[sortField] = sortOrder;

    const smartContracts = await this.smartContractModel
      .find()
      .skip(skip)
      .sort(sort)
      .limit(pageSize)
      .exec();

    return { totalRecords, smartContracts };
  }
}
