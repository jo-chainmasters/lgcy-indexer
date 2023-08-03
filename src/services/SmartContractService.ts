import { Injectable, Logger } from '@nestjs/common';
import { Transaction } from '../model/Transaction';
import { SmartContract, SmartContractParamData } from "../model/SmartContract";
import { CreateSmartContract } from '../model/contracts/CreateSmartContract/CreateSmartContract';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntryType } from '../model/EntryType';
import { SmartContractDetailsProjection } from '../model/projections/SmartContractDetailsProjection';
import { TransactionService } from './transaction.service';
import { Abi } from '../model/contracts/CreateSmartContract/Abi';
import { ContractType } from '../model/ContractType';
import { LgcyService } from './lgcy.service';

const createKeccakHash = require('keccak');

@Injectable()
export class SmartContractService {
  private readonly logger = new Logger(SmartContractService.name);

  constructor(
    @InjectModel(SmartContract.name)
    private readonly smartContractModel: Model<SmartContract>,
    private transactionService: TransactionService,
    private lgcyService: LgcyService,
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

    // generalInformations

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

    projection.generalInformations = {
      totalAssets,
      name,
      txCount,
      creator,
      createdOn,
      powerConsuptionRatio,
    };

    // calling data
    projection.callingData = {
      data: {
        totalCalls: 'TODO',
        totalAddresses: 'TODO',
      },
      topMethods: {},
      topAddresses: {},
    };

    return projection;
  }

  public async findByAddress(address: string) {
    return this.smartContractModel
      .findOne({
        address,
      })
      .exec();
  }

  public async createSmartContract(
    transaction: Transaction,
  ): Promise<SmartContract> {
    const createSmartContractValue =
      transaction.transactionValue as CreateSmartContract;

    const smartContract: SmartContract = {
      // types: SmartContractService.analyzeContractTypes(
      //   createSmartContractValue.abi,
      // ),
      name: createSmartContractValue.name,
      address: transaction.transactionInfo.contractAddress,
      abi: createSmartContractValue.abi,
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
            const myFunction: any = {
              stateMutability: entry.stateMutability.toString(),
            };

            smartContract.parsedAbi.functions[entry.name] = {};

            let inputsStr = '';
            if (entry.inputs) {
              myFunction.inputParams = [];

              for (let i = 0; i < entry.inputs.length; i++) {
                const input = entry.inputs[i];
                inputsStr += input.type + ',';
                myFunction.inputParams.push({
                  type: input.type,
                  name: input.name,
                  indexed: input.indexed,
                });
              }
              inputsStr = inputsStr.substring(0, inputsStr.length - 1);
            }
            if (entry.outputs) {
              myFunction.outputParams = [];

              for (const output of entry.outputs) {
                myFunction.outputParams.push({
                  type: output.type,
                  indexed: output.indexed,
                });
              }
            }
            myFunction.functionSelector =
              entry.name + '(' + (inputsStr ? inputsStr : '') + ')';
            myFunction.functionSignature = createKeccakHash('keccak256')
              .update(myFunction.functionSelector)
              .digest('hex')
              .substring(0, 8);

            smartContract.parsedAbi.functions[myFunction.functionSelector] =
              myFunction;
            smartContract.parsedAbi.functions[entry.name] = myFunction;
            break;

          case EntryType.Event:

            const _event: SmartContractParamData = {name: entry.name};
            let signature = entry.name + '(';
            // smartContract.parsedAbi.events[entry.name] = {};
            if (entry.inputs) {
              _event.inputParams = [];
              for (const input of entry.inputs) {
                _event.inputParams.push({
                  type: input.type,
                  name: input.name,
                  indexed: input.indexed,
                });
                signature += input.type + ',';
              }
              signature = signature.substring(0, signature.length - 1);
            }
            signature += ')';
            signature = createKeccakHash('keccak256')
              .update(signature)
              .digest('hex');
            smartContract.parsedAbi.events[entry.name] = _event;
            smartContract.parsedAbi.events[signature] = _event;
            break;
        }
      }
    }

    smartContract.types = await this.analyzeContractTypes(smartContract);
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

  private async analyzeContractTypes(
    smartContract: SmartContract,
  ): Promise<ContractType[]> {
    const types: ContractType[] = [];

    if (await this.isLrc20(smartContract)) {
      types.push(ContractType._20);
    } else {
      if (await this.isLrc721(smartContract)) {
        types.push(ContractType._721);
        types.push(ContractType._165);
      }
    }

    return types.length > 0 ? types : undefined;
  }

  private async isLrc165(smartContract: SmartContract): Promise<boolean> {
    const hasSupportedInterfaces = this.hasFunction(
      smartContract,
      'supportsInterface(bytes4)',
      ['bool'],
    );

    try {
      const result = await this.lgcyService.callContract(
        smartContract.address,
        'supportsInterface',
        ['0x01ffc9a7'],
      );

      return new Promise((resolve) => {
        resolve(hasSupportedInterfaces && result);
      });
    } catch (e) {
      return new Promise((resolve) => {
        resolve(false);
      });
    }
  }

  private isLrc20(smartContract: SmartContract): boolean {
    return (
      this.hasFunction(smartContract, 'name()', ['string']) &&
      this.hasFunction(smartContract, 'symbol()', ['string']) &&
      this.hasFunction(smartContract, 'decimals()', ['uint8']) &&
      this.hasFunction(smartContract, 'totalSupply()', ['uint256']) &&
      this.hasFunction(smartContract, 'balanceOf(address)', ['uint256']) &&
      this.hasFunction(smartContract, 'transfer(address,uint256)', ['bool']) &&
      this.hasFunction(smartContract, 'transferFrom(address,address,uint256)', [
        'bool',
      ]) &&
      this.hasFunction(smartContract, 'approve(address,uint256)', ['bool']) &&
      this.hasFunction(smartContract, 'allowance(address,address)', [
        'uint256',
      ]) &&
      this.hasFunction(smartContract, 'transferFrom(address,address,uint256)', [
        'bool',
      ]) &&
      this.hasFunction(smartContract, 'transferFrom(address,address,uint256)', [
        'bool',
      ]) &&
      this.hasEvent({
        abi: smartContract.abi,
        name: 'Transfer',
        inputs: ['address', 'address', 'uint256'],
      }) &&
      this.hasEvent({
        abi: smartContract.abi,
        name: 'Approval',
        inputs: ['address', 'address', 'uint256'],
      })
    );
  }

  private async isLrc721(smartContract: SmartContract): Promise<boolean> {
    return (
      (await this.isLrc165(smartContract)) &&
      this.hasFunction(smartContract, 'balanceOf(address)', ['uint256']) &&
      this.hasFunction(smartContract, 'ownerOf(uint256)', ['address']) &&
      this.hasFunction(
        smartContract,
        'safeTransferFrom(address,address,uint256,bytes)',
      ) &&
      this.hasFunction(
        smartContract,
        'safeTransferFrom(address,address,uint256)',
      ) &&
      this.hasFunction(
        smartContract,
        'transferFrom(address,address,uint256)',
      ) &&
      this.hasFunction(smartContract, 'approve(address,uint256)') &&
      this.hasFunction(smartContract, 'setApprovalForAll(address,bool)') &&
      this.hasFunction(smartContract, 'getApproved(uint256)', ['address']) &&
      this.hasFunction(smartContract, 'isApprovedForAll(address,address)', [
        'bool',
      ]) &&
      this.hasEvent({
        abi: smartContract.abi,
        name: 'Transfer',
        inputs: ['address', 'address', 'uint256'],
      }) &&
      this.hasEvent({
        abi: smartContract.abi,
        name: 'Approval',
        inputs: ['address', 'address', 'uint256'],
      }) &&
      this.hasEvent({
        abi: smartContract.abi,

        name: 'ApprovalForAll',
        inputs: ['address', 'address', 'bool'],
      })
    );
  }

  private hasFunction(
    smartContract: SmartContract,
    functionSelector: string,
    outputs: string[] = [],
  ): boolean {
    if (smartContract.parsedAbi.functions[functionSelector]) {
      const func = smartContract.parsedAbi.functions[functionSelector];
      if (outputs.length > 0) {
        for (let i = 0; i < outputs.length; i++) {
          if (outputs[i] !== func.outputParams[i].type) {
            return false;
          }
        }
        return true;
      } else {
        return (
          func.outputParams === undefined || func.outputParams.length === 0
        );
      }
    } else {
      return false;
    }
  }

  // private static hasFunction(config: {
  //   abi: Abi;
  //   name: string;
  //   inputs?: string[];
  //   outputs?: string[];
  // }): boolean {
  //   const index = SmartContractService.getFunctionIndex(
  //     config.abi,
  //     config.name,
  //   );
  //   if (index === -1) {
  //     return false;
  //   }
  //
  //   const functionEntry = config.abi.entrys[index];
  //   if (config.inputs && config.inputs.length > 0) {
  //     if (
  //       !(
  //         functionEntry.inputs &&
  //         functionEntry.inputs.length === config.inputs.length
  //       )
  //     ) {
  //       return false;
  //     }
  //
  //     for (let i = 0; i < config.inputs.length; i++) {
  //       const input = config.inputs[i];
  //       if (functionEntry.inputs[i].type !== input) {
  //         return false;
  //       }
  //     }
  //   }
  //
  //   if (config.outputs && config.outputs.length > 0) {
  //     if (
  //       !(
  //         functionEntry.outputs &&
  //         functionEntry.outputs.length === config.outputs.length
  //       )
  //     ) {
  //       return false;
  //     }
  //
  //     for (let i = 0; i < config.outputs.length; i++) {
  //       const outputs = config.outputs[i];
  //       if (functionEntry.outputs[i].type !== outputs) {
  //         return false;
  //       }
  //     }
  //   }
  //
  //   return true;
  // }

  private hasEvent(config: {
    abi: Abi;
    name: string;
    inputs?: string[];
  }): boolean {
    const index = this.getEventIndex(config.abi, config.name);
    if (index === -1) {
      return false;
    }

    const eventEntry = config.abi.entrys[index];
    if (config.inputs && config.inputs.length > 0) {
      if (
        !(
          eventEntry.inputs && eventEntry.inputs.length === config.inputs.length
        )
      ) {
        return false;
      }

      for (let i = 0; i < config.inputs.length; i++) {
        const input = config.inputs[i];
        if (eventEntry.inputs[i].type !== input) {
          return false;
        }
      }
    }

    return true;
  }

  private getEventIndex(abi: Abi, eventName: string): number {
    for (let i = 0; i < abi.entrys.length; i++) {
      const entry = abi.entrys[i];
      if (entry.type === EntryType.Event && entry.name === eventName) return i;
    }
    return -1;
  }
}
