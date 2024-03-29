import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '../model/Transaction';
import { LgcyService } from './lgcy.service';
import { TransactionSuccessCode } from '../model/TransactionSuccessCode';
import { TransactionType } from '../model/TransactionType';
import { ContractResult } from '../model/ContractResult';
import { TransferAssetContract } from '../model/contracts/TransferAssetContract';
import { WitnessCreateContract } from '../model/contracts/WitnessCreateContract';
import { TriggerSmartContract } from '../model/contracts/TriggerSmartContract';
import { AccountUpdateContract } from '../model/contracts/AccountUpdateContract';
import { UpdateBrokerageContract } from '../model/contracts/UpdateBrokerageContract';
import { UnfreezeBalanceContract } from '../model/contracts/UnfreezeBalanceContract';
import { FreezeBalanceContract } from '../model/contracts/FreezeBalanceContract';
import { CreateSmartContract } from '../model/contracts/CreateSmartContract/CreateSmartContract';
import { VoteWitnessContract } from '../model/contracts/VoteWitnessContract/VoteWitnessContract';
import { Vote } from '../model/contracts/VoteWitnessContract/Vote';
import { ProposalCreateContract } from '../model/contracts/ProposalCreateContract';
import { AssetIssueContract } from '../model/contracts/AssetIssueContract/AssetIssueContract';
import { Permission } from '../model/contracts/common/Permission';
import { Key } from '../model/contracts/common/Key';
import { AccountPermissionUpdateContract } from '../model/contracts/AccountPermissionUpdateContract';
import { TransactionInfo } from '../model/TransactionInfo/TransactionInfo';
import { InternalTransaction } from '../model/TransactionInfo/InternalTransaction';
import { Log } from '../model/TransactionInfo/Log';
import { Abi } from '../model/contracts/CreateSmartContract/Abi';
import { Entry } from '../model/contracts/CreateSmartContract/Entry';
import { EntryType } from '../model/EntryType';
import { StateMutabilityType } from '../model/StateMutabilityType';
import { InOutput } from '../model/contracts/CreateSmartContract/InOutput';
import { ResourceType } from '../model/ResourceType';
import { PermissionType } from '../model/PermissionType';
import { ContractCall } from '../model/ContractCall';
import { SmartContractService } from './SmartContractService';
import { SmartContract } from '../model/SmartContract';
import { TransactionEvent } from '../model/TransactionEvent';
import { NumberConverter } from '../utils/NumberConverter';
import { PageService } from './PageService';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    private lgcyService: LgcyService,
    private pageService: PageService,
  ) {
    this.logger;
  }

  public isSuccessfull(transaction: any): boolean {
    if (!transaction) return false;

    if (transaction.raw_data?.contract[0]?.type) {
      if (
        transaction.raw_data.contract[0].type === 'TransferContract' ||
        transaction.raw_data.contract[0].type === 'FreezeBalanceContract' ||
        transaction.raw_data.contract[0].type === 'UnfreezeBalanceContract' ||
        transaction.raw_data.contract[0].type === 'WitnessCreateContract' ||
        transaction.raw_data.contract[0].type === 'VoteWitnessContract' ||
        transaction.raw_data.contract[0].type === 'UpdateBrokerageContract' ||
        transaction.raw_data.contract[0].type === 'WithdrawBalanceContract' ||
        transaction.raw_data.contract[0].type === 'ProposalCreateContract' ||
        transaction.raw_data.contract[0].type === 'AccountUpdateContract' ||
        transaction.raw_data.contract[0].type ===
          'AccountPermissionUpdateContract' ||
        transaction.raw_data.contract[0].type === 'AssetIssueContract' ||
        transaction.raw_data.contract[0].type === 'TransferAssetContract'
      ) {
        if (transaction.ret[0]?.contractRet) {
          return transaction.ret[0].contractRet === 'SUCCESS';
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  public mapTransaction(
    transaction: any,
    blockNumber: number,
    timestamp: Date,
  ): Transaction {
    // this.logger.debug(transaction);
    const t: Transaction = {
      hash: transaction.txID as string,
      blockNumber,
      timestamp,
      type: TransactionType.valueOf(
        transaction.raw_data.contract[0].type,
      ) as TransactionType,
      sender: this.lgcyService.hexToBase58(
        transaction.raw_data.contract[0].parameter.value.owner_address,
      ),
      memo: transaction.raw_data.data
        ? this.lgcyService.hexToUtf8(transaction.raw_data.data as string)
        : undefined,
      successfull: this.isSuccessfull(transaction),
    };

    switch (t.type) {
      case TransactionType.TransferContract:
        const { receiver, amount } = this.mapTransfer(transaction);
        t.receiver = receiver;
        t.amount = amount;
        break;
      case TransactionType.CreateSmartContract:
        const { name, bytecode, consumeUserResourcePercent, abi } =
          this.mapCreateSmartContract(transaction);
        (t.transactionValue as CreateSmartContract) = {
          name,
          bytecode,
          consumeUserResourcePercent,
          abi,
        };
        break;
      case TransactionType.TriggerSmartContract:
        const { contractAddress, callValue, data, callTokenValue, tokenId } =
          this.mapTriggerSmartContract(transaction);
        (t.transactionValue as TriggerSmartContract) = {
          contractAddress,
          callValue,
          data,
          callTokenValue,
          tokenId,
        };
        break;
      case TransactionType.FreezeBalanceContract:
        const { frozenBalance, frozenDuration, resource, receiverAddress } =
          this.mapFreezeBalanceContract(transaction);
        (t.transactionValue as FreezeBalanceContract) = {
          frozenBalance,
          frozenDuration,
          resource: resource,
          receiver: receiverAddress,
        };
        break;
      case TransactionType.UnfreezeBalanceContract:
        const { unfreezeReceiver, unfreezeResource } =
          this.mapUnfreezeBalanceContract(transaction);
        (t.transactionValue as UnfreezeBalanceContract) = {
          receiver: unfreezeReceiver,
          resource: unfreezeResource,
        };
        break;
      case TransactionType.WitnessCreateContract:
        const url = this.mapWitnessCreateContract(transaction);
        (t.transactionValue as WitnessCreateContract) = {
          url,
        };
        break;
      case TransactionType.VoteWitnessContract:
        const { support, votes } = this.mapVoteWitnessContract(transaction);
        (t.transactionValue as VoteWitnessContract) = {
          support,
          votes,
        };
        break;
      case TransactionType.UpdateBrokerageContract:
        const brokerage = this.mapUpdateBrokerage(transaction);
        (t.transactionValue as UpdateBrokerageContract) = {
          brokerage,
        };
        break;
      case TransactionType.WithdrawBalanceContract:
        // No params for withdraw
        t.transactionValue = undefined;
        break;
      case TransactionType.ProposalCreateContract:
        // todo doesnt work
        const params = this.mapProposalCreate(transaction);
        (t.transactionValue as ProposalCreateContract) = {
          parameters: params,
        };
        break;
      case TransactionType.AccountUpdateContract:
        const accountName = this.mapAccountUpdate(transaction);
        (t.transactionValue as AccountUpdateContract) = {
          accountName,
        };
        break;
      case TransactionType.AccountPermissionUpdateContract:
        const { owner, witness, actives } =
          this.mapAccountPermissionUpdate(transaction);
        (t.transactionValue as AccountPermissionUpdateContract) = {
          owner,
          witness,
          actives,
        };
        break;
      case TransactionType.AssetIssueContract:
        const {
          id,
          tokenName,
          abbr,
          totalSupply,
          frozenSupply,
          usdlNum,
          precision,
          num,
          startTime,
          endTime,
          order,
          voteScore,
          description,
          tokenUrl,
          freeAssetNetLimit,
          publicFreeAssetNetLimit,
          publicFreeAssetNetUsage,
          publicLatestFreeNetTime,
        } = this.mapAssetIssueContract(transaction);
        (t.transactionValue as AssetIssueContract) = {
          id,
          name: tokenName,
          abbr,
          totalSupply,
          frozenSupply,
          usdlNum,
          precision,
          num,
          startTime,
          endTime,
          order,
          voteScore,
          description,
          url: tokenUrl,
          freeAssetNetLimit,
          publicFreeAssetNetLimit,
          publicFreeAssetNetUsage,
          publicLatestFreeNetTime,
        };
        break;
      case TransactionType.TransferAssetContract:
        const { assetName, tokenReceiver, tokenAmount } =
          this.mapTransferAsset(transaction);
        (t.transactionValue as TransferAssetContract) = {
          assetName,
          receiver: tokenReceiver,
          amount: tokenAmount,
        };
        break;
      default:
        throw new Error('Unknown TransactionType: ' + t.type);
    }

    return t;
  }

  private mapTransferAsset(transaction) {
    const contractValue = transaction.raw_data.contract[0].parameter.value;
    const assetName = this.lgcyService.hexToUtf8(contractValue.asset_name);
    const tokenReceiver = this.lgcyService.hexToBase58(
      contractValue.to_address,
    );
    const tokenAmount = contractValue.amount;

    return { assetName, tokenReceiver, tokenAmount };
  }

  private mapAssetIssueContract(transaction) {
    const contractValue = transaction.raw_data.contract[0].parameter.value;
    const id = contractValue.id;
    const tokenName = this.lgcyService.hexToUtf8(contractValue.name);
    const abbr = this.lgcyService.hexToUtf8(contractValue.abbr);
    const totalSupply = contractValue.total_supply;
    const frozenSupply = contractValue.frozen_supply;
    const usdlNum = contractValue.usdlNum;
    const precision = contractValue.precision;
    const num = contractValue.num;
    const startTime = contractValue.start_time;
    const endTime = contractValue.end_time;
    const order = contractValue.order;
    const voteScore = contractValue.vote_score;
    const description = this.lgcyService.hexToUtf8(contractValue.description);
    const tokenUrl = this.lgcyService.hexToUtf8(contractValue.url);
    const freeAssetNetLimit = contractValue.free_asset_net_limit;
    const publicFreeAssetNetLimit = contractValue.public_free_asset_net_limit;
    const publicFreeAssetNetUsage = contractValue.public_free_asset_net_usage;
    const publicLatestFreeNetTime = contractValue.public_latest_free_net_time;

    return {
      id,
      tokenName,
      abbr,
      totalSupply,
      frozenSupply,
      usdlNum,
      precision,
      num,
      startTime,
      endTime,
      order,
      voteScore,
      description,
      tokenUrl,
      freeAssetNetLimit,
      publicFreeAssetNetLimit,
      publicFreeAssetNetUsage,
      publicLatestFreeNetTime,
    };
  }

  private mapAccountPermissionUpdate(transaction) {
    const contractValue = transaction.raw_data.contract[0].parameter.value;
    const oldOwner = contractValue.owner;
    const oldWitness = contractValue.witness;
    const oldActives = contractValue.actives;

    const newKeysOwner: Key[] = [];
    if (oldOwner && oldOwner.keys) {
      for (const key of oldOwner.keys) {
        const newKey: Key = {
          address: this.lgcyService.hexToBase58(key.address),
          weight: key.weight,
        };
        newKeysOwner.push(newKey);
      }
    }

    const newKeysWitness: Key[] = [];
    if (oldWitness && oldWitness.keys) {
      for (const key of oldWitness.keys) {
        const newKey: Key = {
          address: this.lgcyService.hexToBase58(key.address),
          weight: key.weight,
        };
        newKeysWitness.push(newKey);
      }
    }

    let owner: Permission;
    if (oldOwner) {
      owner = {
        type: PermissionType.valueOf(oldOwner.type),
        id: oldOwner.id,
        permissionName: oldOwner.permission_ame,
        threshold: oldOwner.threshold,
        parentId: oldOwner.parent_id,
        operations: oldOwner.operations,
        keys: newKeysOwner,
      };
    }

    let witness: Permission;
    if (oldWitness) {
      witness = {
        type: PermissionType.valueOf(oldWitness.type) as PermissionType,
        id: oldWitness.id,
        permissionName: oldWitness.permissionName,
        threshold: oldWitness.threshold,
        parentId: oldWitness.parentId,
        operations: oldWitness.operations,
        keys: newKeysWitness,
      };
    }

    const actives: Permission[] = [];
    if (oldActives) {
      for (const active of oldActives) {
        const newKeysActive: Key[] = [];
        if (active && active.keys) {
          for (const key of active.keys) {
            const newKeyActive: Key = {
              address: this.lgcyService.hexToBase58(key.address),
              weight: key.weight,
            };
            newKeysActive.push(newKeyActive);
          }
        }

        const newActive: Permission = {
          type: PermissionType.valueOf(active.type) as PermissionType,
          id: active.id,
          permissionName: active.permissionName,
          threshold: active.threshold,
          parentId: active.parentId,
          operations: active.operations,
          keys: newKeysActive,
        };
        actives.push(newActive);
      }
    }

    return { owner, witness, actives };
  }

  private mapAccountUpdate(transaction) {
    const contractValue = transaction.raw_data.contract[0].parameter.value;
    const accountName = this.lgcyService.hexToUtf8(contractValue.account_name);
    return accountName;
  }

  private mapProposalCreate(transaction): Map<number, number> {
    const contractValue = transaction.raw_data.contract[0].parameter.value;
    const parameters = contractValue.parameters;
    const newParams = new Map<number, number>();
    if (parameters) {
      const keys = Object.keys(parameters);
      for (const key of keys) {
        const value = parameters[key];
        newParams.set(Number(key), value);
      }
    }

    if (newParams.size > 0) {
      return newParams;
    } else {
      return undefined;
    }
  }

  private mapUpdateBrokerage(transaction) {
    const contractValue = transaction.raw_data.contract[0].parameter.value;
    const brokerage = contractValue.brokerage;
    return brokerage;
  }

  private mapVoteWitnessContract(transaction) {
    const contractValue = transaction.raw_data.contract[0].parameter.value;
    const support = contractValue.support;
    const votes: Vote[] = [];
    for (const vote of contractValue.votes as []) {
      votes.push({
        voteAddress: this.lgcyService.hexToBase58((vote as any).vote_address),
        voteCount: (vote as any).vote_count,
      });
    }
    return { support, votes };
  }

  private mapUnfreezeBalanceContract(transaction) {
    const contractValue = transaction.raw_data.contract[0].parameter.value;
    const unfreezeReceiver = this.lgcyService.hexToBase58(
      contractValue.receiver_address,
    );
    const unfreezeResource = ResourceType.valueOf(contractValue.resource);
    return { unfreezeReceiver, unfreezeResource };
  }

  private mapWitnessCreateContract(transaction) {
    const contractValue = transaction.raw_data.contract[0].parameter.value;
    const url = this.lgcyService.hexToUtf8(contractValue.url);
    return url;
  }

  private mapFreezeBalanceContract(transaction) {
    const contractValue = transaction.raw_data.contract[0].parameter.value;
    const frozenBalance = contractValue.frozen_balance;
    const frozenDuration = contractValue.frozen_duration;
    const resource = ResourceType.valueOf(contractValue.resource);
    const receiverAddress = this.lgcyService.hexToBase58(
      contractValue.receiver_address,
    );
    return { frozenBalance, frozenDuration, resource, receiverAddress };
  }

  private mapTriggerSmartContract(transaction) {
    const contractValue = transaction.raw_data.contract[0].parameter.value;
    const contractAddress = this.lgcyService.hexToBase58(
      contractValue.contract_address,
    );
    const callValue = contractValue.call_value;
    const data = contractValue.data;
    const callTokenValue = contractValue.call_token_value;
    const tokenId = contractValue.token_d;
    return { contractAddress, callValue, data, callTokenValue, tokenId };
  }

  private mapCreateSmartContract(transaction) {
    const contractValue = transaction.raw_data.contract[0].parameter.value;
    const name = contractValue.new_contract.name;
    const bytecode = contractValue.new_contract.bytecode;
    const consumeUserResourcePercent =
      contractValue.new_contract.consume_user_resource_percent;
    const abi = this.mapAbi(contractValue.new_contract.abi);
    return { name, bytecode, consumeUserResourcePercent, abi };
  }

  private mapAbi(abi: any): Abi {
    if (abi?.entrys) {
      const entries: Entry[] = [];
      for (const entry of abi.entrys as []) {
        entries.push(this.mapEntry(entry));
      }
      return {
        entrys: entries,
      };
    }
    return undefined;
  }

  private mapEntry(entry: any): Entry {
    const e: Entry = {
      anonymous: entry.anonymous,
      constant: entry.constant,
      name: entry.name,
      type: EntryType.valueOf(entry.type),
      payable: entry.payable,
      stateMutability: StateMutabilityType.valueOf(entry.stateMutability),
    };

    if (entry.inputs) {
      e.inputs = [];
      for (const input of entry.inputs as []) {
        e.inputs.push(this.mapInOutPut(input));
      }
    }

    if (entry.outputs) {
      e.outputs = [];
      for (const output of entry.outputs as []) {
        e.outputs.push(this.mapInOutPut(output));
      }
    }

    return e;
  }

  private mapInOutPut(input: any): InOutput {
    return {
      indexed: input.indexed,
      name: input.name,
      type: input.type,
    };
  }

  private mapTransfer(transaction: any) {
    const contractValue = transaction.raw_data.contract[0].parameter.value;
    const receiver = this.lgcyService.hexToBase58(contractValue.to_address);
    const amount = contractValue.amount;
    return { receiver, amount };
  }

  public async save(transaction: Transaction): Promise<void> {
    await this.transactionModel.create(transaction);
  }

  public async insertAll(transactions: Transaction[]): Promise<void> {
    await this.transactionModel.insertMany(transactions);
  }

  public async setCallData(hash: string, callData: ContractCall) {
    return this.transactionModel.findOneAndUpdate(
      {
        hash,
      },
      {
        contractCall: callData,
      },
    );
  }

  public async setParserInfo(
    transaction: Transaction,
    name: string,
    value: boolean,
  ) {
    if (!transaction.parserInfo) {
      transaction.parserInfo = {};
    }
    transaction.parserInfo[name] = value;

    const parserInfo = {};
    parserInfo[name] = value;
    const update = {};
    const parserInfoString = 'parserInfo.' + name;
    update[parserInfoString] = value;

    await this.transactionModel.findOneAndUpdate(
      { hash: transaction.hash },
      update,
    );
  }

  public async updateAll(transactions: Transaction[]): Promise<void> {
    for (const transaction of transactions) {
      const t = await this.transactionModel.updateOne(
        { hash: transaction.hash },
        transaction,
      );
      const i = 0;
    }
  }

  public async findByHash(hash: string) {
    return await this.transactionModel.findOne({ hash }).exec();
  }

  public async findByAddress(address: string) {
    return await this.transactionModel
      .find({ $or: [{ sender: address }, { receiver: address }] })
      .exec();
  }

  public async findWithoutEventParser(num = 10) {
    const agg = [
      {
        $match: {
          type: 'TriggerSmartContract',
          successfull: true,
          'transactionInfo.logs': { $exists: true },
          $or: [
            {
              'parserInfo.event': false,
            },
            {
              'parserInfo.event': { $exists: false },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'smartcontracts',
          localField: 'transactionInfo.contractAddress',
          foreignField: 'address',
          as: 'ca',
        },
      },
      {
        $match: {
          'ca.types': '_20',
        },
      },
      {
        $unset: 'ca',
      },
    ];
    return await this.transactionModel
      .aggregate(agg)
      .sort({ blockNumber: 1 })
      .limit(num)
      .exec();
    // return await this.transactionModel
    //   .find({
    //     type: TransactionType.TriggerSmartContract,
    //     'transactionInfo.logs': { $exists: true },
    //     $where: 'this.transactionInfo.logs.length>0',
    //     successfull: true,
    //     'parserInfo.transactionInfo': true,
    //     $or: [
    //       {
    //         'parserInfo.event': false,
    //       },
    //       {
    //         'parserInfo.event': { $exists: false },
    //       },
    //     ],
    //   })
    //   .sort({ blockNumber: 1 })
    //   .limit(num)
    //   .exec();
  }

  public async findWithoutTransactionInfo(num = 10) {
    return await this.transactionModel
      .find({
        $or: [
          {
            'parserInfo.transactionInfo': false,
          },
          {
            'parserInfo.transactionInfo': { $exists: false },
          },
        ],
      })
      .sort({ blockNumber: 1 })
      .limit(num)
      .exec();
  }

  public async findWithoutBalancing(num = 10) {
    return await this.transactionModel
      .find({
        'parserInfo.transactionInfo': true,
        $or: [
          {
            'parserInfo.usdlBalancing': false,
          },
          {
            'parserInfo.usdlBalancing': { $exists: false },
          },
        ],
      })
      .sort({ blockNumber: 1 })
      .limit(num)
      .exec();
  }

  public async findWithoutTriggerSmartContactAnalayzing(num = 10) {
    return await this.transactionModel
      .find({
        type: 'TriggerSmartContract',
        'parserInfo.transactionInfo': true,
        $or: [
          {
            'parserInfo.triggerSmartContractRecorded': false,
          },
          {
            'parserInfo.triggerSmartContractRecorded': { $exists: false },
          },
        ],
      })
      .sort({ blockNumber: 1 })
      .limit(num)
      .exec();
  }

  public async findWithoutLrc10Recorded(num = 10) {
    return await this.transactionModel
      .find({
        type: 'AssetIssueContract',
        successfull: true,
        'parserInfo.transactionInfo': true,
        $or: [
          {
            'parserInfo.lrc10Recorded': false,
          },
          {
            'parserInfo.lrc10Recorded': { $exists: false },
          },
        ],
      })
      .sort({ blockNumber: 1 })
      .limit(num)
      .exec();
  }

  public async findWithoutLrc10Balanced(num = 10) {
    return await this.transactionModel
      .find({
        type: 'TransferAssetContract',
        successfull: true,
        'parserInfo.transactionInfo': true,
        $or: [
          {
            'parserInfo.lrc10Balanced': false,
          },
          {
            'parserInfo.lrc10Balanced': { $exists: false },
          },
        ],
      })
      .sort({ blockNumber: 1 })
      .limit(num)
      .exec();
  }

  public async findWithoutCreateSmartContractAnalyzing(num = 10) {
    return await this.transactionModel
      .find({
        type: 'CreateSmartContract',
        successfull: true,
        'parserInfo.transactionInfo': true,
        $or: [
          {
            'parserInfo.smartContractRecorded': false,
          },
          {
            'parserInfo.smartContractRecorded': { $exists: false },
          },
        ],
      })
      .sort({ blockNumber: 1 })
      .limit(num)
      .exec();
  }

  public async countTransactions() {
    return this.transactionModel.count().exec();
  }
  public async countTransactionsBlockRange(from: number, to: number) {
    return this.transactionModel
      .count({
        blockNumber: { $gte: from, $lt: to },
      })
      .exec();
  }

  public async countTransactionsTimeRange(from: Date, to: Date) {
    return this.transactionModel
      .count({
        timestamp: { $gte: from, $lt: to },
      })
      .exec();
  }

  public async setEvents(transaction: Transaction, events: TransactionEvent[]) {
    return await this.transactionModel
      .findOneAndUpdate(
        {
          hash: transaction.hash,
        },
        {
          $set: {
            events: events,
          },
        },
      )
      .exec();
  }

  public async getTransactionInfoFromChain(transaction: Transaction) {
    const transactionInfo = await this.lgcyService.getTransactionInfoFromHttp(
      transaction.hash,
    );

    return this.mapTransactionInfo(transactionInfo, transaction);
  }

  private mapTransactionInfo(
    data: any,
    transaction: Transaction,
  ): TransactionInfo {
    const txInfo: TransactionInfo = {
      contractAddress: data.contract_address
        ? this.lgcyService.hexToBase58(data.contract_address)
        : undefined,
      successCode: TransactionSuccessCode.valueOf(
        data.result,
      ) as TransactionSuccessCode,
      resMessage: data.resMessage
        ? this.lgcyService.hexToUtf8(data.resMessage)
        : undefined,
      assetIssueID: data.assetIssueID
        ? data.assetIssueID
        : undefined,
      withdrawAmount: data.withdraw_amount,
      unfreezeAmount: data.unfreeze_amount,
      exchangeReceivedAmount: data.exchange_received_amount,
      exchangeInjectAnotherAmount: data.exchange_inject_another_amount,
      exchangeWithdrawAnotherAmount: data.exchange_withdraw_another_amount,
      exchangeId: data.exchange_id,
      shieldedTransactionFee: data.shielded_transaction_fee,
      orderId: data.orderId,
    };

    if (data.contractResult) {
      txInfo.contractResult = [];
      for (const contractResultElement of data.contractResult) {
        if (contractResultElement) {
          txInfo.contractResult.push(contractResultElement);
        }
      }
      if (txInfo.contractResult.length == 0) {
        delete txInfo.contractResult;
      }
    }

    if (data.receipt && transaction.type !== TransactionType.TransferContract) {
      txInfo.resourceReceipt = {
        kandyUsage: data.receipt.kandy_usage,
        kandyFee: data.receipt.kandy_fee,
        originKandyUsage: data.receipt.origin_kandy_usage,
        kandyUsageTotal: data.receipt.kandy_usage_total,
        netUsage: data.receipt.net_usage,
        netFee: data.receipt.net_fee,
        result: ContractResult.valueOf(data.receipt.result) as ContractResult,
      };
    }

    if (data.log) {
      txInfo.logs = [];
      for (const logElement of data.log) {
        const log: Log = {
          address: logElement.address
            ? this.lgcyService.hexToBase58('30' + logElement.address)
            : undefined,
          data: logElement.data,
          topics: [],
        };
        if (logElement.topics) {
          for (const topic of logElement.topics) {
            log.topics.push(topic);
          }
        }
        txInfo.logs.push(log);
      }
    }

    if (data.internal_transactions) {
      txInfo.internalTransactions = [];
      for (const internalTransaction of data.internal_transactions) {
        const intTx: InternalTransaction = {
          hash: internalTransaction.hash,
          callerAddress: internalTransaction.caller_address
            ? this.lgcyService.hexToBase58(internalTransaction.caller_address)
            : undefined,
          transferToAddress: internalTransaction.transferTo_address
            ? this.lgcyService.hexToBase58(
                internalTransaction.transferTo_address,
              )
            : undefined,
          note: internalTransaction.note
            ? this.lgcyService.hexToUtf8(internalTransaction.note)
            : undefined,
          rejected: internalTransaction.rejected,
        };
        if (internalTransaction.callValueInfo) {
          intTx.callValueInfo = [];
          for (const callValueInfoElement of internalTransaction.callValueInfo) {
            intTx.callValueInfo.push({
              callValue: callValueInfoElement.callValue,
              tokenId: callValueInfoElement.tokenId
                ? this.lgcyService.hexToUtf8(callValueInfoElement.tokenId)
                : undefined,
            });
          }
        }

        txInfo.internalTransactions.push(intTx);
      }
    }

    if (data.orderDetails) {
      txInfo.orderDetails = {
        makerOrderId: data.makerOrderId,
        takerOrderId: data.takerOrderId,
        fillSellQuantity: data.fillSellQuantity,
        fillBuyQuantity: data.fillBuyQuantity,
      };
    }

    // calculating fees
    transaction.fee = data.fee;

    // check if successfull
    if (
      transaction.type === TransactionType.CreateSmartContract ||
      transaction.type === TransactionType.TriggerSmartContract
    ) {
      if (txInfo.resourceReceipt.result === ContractResult.SUCCESS) {
        transaction.successfull = true;
      } else {
        transaction.successfull = false;
      }
    }

    return txInfo;
  }

  public async getPageByAddress(
    address: string,
    skip: number,
    pageSize: number,
    sortField: string,
    sortOrder: number,
  ) {
    const totalRecords = await this.transactionModel
      .count({ $or: [{ sender: address }, { receiver: address }] })
      .exec();

    const sort = {};
    sort[sortField] = sortOrder;

    const transactions = await this.transactionModel
      .find({
        $or: [{ sender: address }, { receiver: address }],
      })
      .skip(skip)
      .sort(sort)
      .limit(pageSize)
      .exec();

    return {
      totalRecords,
      transactions: this.mapTransactionsForHttpResponse(transactions),
    };
  }

  public async findInTimeRange(start: Date, end: Date) {
    return this.transactionModel
      .find({
        timestamp: { $gte: start, $lt: end },
      })
      .exec();
  }

  public async getTstPage(query) {
    const page = await this.pageService.getPage(this.transactionModel, query);
    if (page.data) {
      page.data = this.mapTransactionsForHttpResponse(page.data);
    }
    return page;
  }

  public async getPage(
    skip: number,
    pageSize: number,
    sortField: string,
    sortOrder: number,
    filters?: { [key: string]: { matchMode: string; value: string } },
  ) {
    const sort = {};
    sort[sortField] = sortOrder;

    const f = {};
    if (filters) {
      for (const key of Object.keys(filters)) {
        const mode = filters[key].matchMode;
        const value = filters[key].value;

        switch (mode) {
          case 'contains':
            f[key] = RegExp('.*' + value + '.*', 'i');
            break;
          case 'startsWith':
            f[key] = RegExp(value + '.*', 'i');
            break;
          case 'equals':
            f[key] = value;
            break;
        }
      }
    }

    const totalRecords = await this.transactionModel.count(f).exec();

    const transactions = await this.transactionModel
      .find(f)
      .skip(skip)
      .sort(sort)
      .limit(pageSize)
      .exec();

    return {
      totalRecords,
      transactions: this.mapTransactionsForHttpResponse(transactions),
    };
  }

  public mapTransactionForHttpResponse(transaction: Transaction) {
    const transactionProjection: any = JSON.parse(JSON.stringify(transaction));
    if (transaction.amount) {
      transactionProjection.amount = NumberConverter.decimal128ToBigDecimal(
        transaction.amount,
      );
    }
    return transactionProjection;
  }

  public mapTransactionsForHttpResponse(transactions: Transaction[]) {
    return transactions.map((e) => this.mapTransactionForHttpResponse(e));
  }
}
