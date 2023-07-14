import { Injectable } from "@nestjs/common";
import { Transaction } from "../schemas/Transaction";
import { SmartContract } from "../schemas/SmartContract";
import { CreateSmartContract } from "../schemas/contracts/CreateSmartContract/CreateSmartContract";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EntryType } from "../schemas/enums/EntryType";

@Injectable()
export class SmartContractService {
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
      };
      for (const entry of (transaction.transactionValue as CreateSmartContract)
        .abi.entrys) {
        if (entry.type === EntryType.Function) {
          smartContract.abi.functions[entry.name] = {
            stateMutability: entry.stateMutability.toString(),
          };

          if (entry.inputs) {
            smartContract.abi.functions[entry.name].inputParams = {};

            for (const input of entry.inputs) {
              smartContract.abi.functions[entry.name].inputParams[input.name] =
                { type: input.type, indexed: input.indexed };
            }
          }
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
