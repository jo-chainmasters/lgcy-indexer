import { Injectable, Logger } from '@nestjs/common';
import { Transaction } from '../model/Transaction';
import { SmartContract } from '../model/SmartContract';
import { CreateSmartContract } from '../model/contracts/CreateSmartContract/CreateSmartContract';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntryType } from '../model/EntryType';
import e from 'express';
import { SmartContractDetailsProjection } from '../model/projections/SmartContractDetailsProjection';
import { TransactionService } from './transaction.service';

@Injectable()
export class SmartContractService {
  private readonly logger = new Logger(SmartContractService.name);

  constructor(
    @InjectModel(SmartContract.name)
    private readonly smartContractModel: Model<SmartContract>,
    private transactionService: TransactionService,
  ) {}

  public async insertAll(smartContracts: SmartContract[]) {
    await this.smartContractModel.insertMany(smartContracts);
  }

  public async getDetailsProjection(address: string) {
    const projection = new SmartContractDetailsProjection();

    const smartContract = await this.smartContractModel
      .findOne({
        address,
      })
      .exec();

    const totalAssets = 'TODO';
    let name = 'TODO';
    const txCount = 'TODO';
    let creator = 'TODO';
    let createdOn = 'TODO';
    const powerConsuptionRatio = 'TODO';

    projection.contract = smartContract;

    name = smartContract.name;
    creator = smartContract.created.createdBy;
    createdOn = smartContract.created.createdAtDate.toISOString();

    // const transactions = await this.transactionService.findByAddress(
    //   smartContract.address,
    // );
    // txCount = transactions.length.toString();

    projection.generalInformations = {
      totalAssets,
      name,
      txCount,
      creator,
      createdOn,
      powerConsuptionRatio,
    };
    return projection;
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
      smartContract.parsedAbi = {
        functions: {},
        events: {},
      };
      for (const entry of (transaction.transactionValue as CreateSmartContract)
        .abi.entrys) {
        switch (entry.type) {
          case EntryType.Function:
            smartContract.parsedAbi.functions[entry.name] = {
              stateMutability: entry.stateMutability.toString(),
            };

            if (entry.inputs) {
              smartContract.parsedAbi.functions[entry.name].inputParams = {};

              for (let i = 0; i < entry.inputs.length; i++) {
                const input = entry.inputs[i];

                if (
                  smartContract.parsedAbi.functions[entry.name].inputParams[
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

                smartContract.parsedAbi.functions[entry.name].inputParams[
                  input.name
                ] = { type: input.type, indexed: input.indexed };
              }
            }
            if (entry.outputs) {
              smartContract.parsedAbi.functions[entry.name].outputParams = [];

              for (const output of entry.outputs) {
                smartContract.parsedAbi.functions[entry.name].outputParams.push(
                  {
                    type: output.type,
                    indexed: output.indexed,
                  },
                );
              }
            }
            break;
          case EntryType.Event:
            smartContract.parsedAbi.events[entry.name] = {};
            if (entry.inputs) {
              smartContract.parsedAbi.events[entry.name].inputParams = {};
              for (const input of entry.inputs) {
                smartContract.parsedAbi.events[entry.name].inputParams[
                  input.name
                ] = {
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
