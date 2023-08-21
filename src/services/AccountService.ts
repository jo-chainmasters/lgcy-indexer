import { Injectable, Logger } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Account, TokenBalances } from '../model/Account';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as OrigSchema, Schema, Types } from 'mongoose';
import { Transaction } from '../model/Transaction';
import bigDecimal = require('js-big-decimal');
import { AccountProjection } from '../model/projections/AccountProjection';
import { NumberConverter } from '../utils/NumberConverter';
import { LgcyService } from './lgcy.service';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private transactionService: TransactionService,
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    private lgcyService: LgcyService,
  ) {}

  public createAccountProjection(
    account: Account,
    accoutOnChain: any,
    assets: { symbol: string; value: bigDecimal }[],
  ): AccountProjection {
    const pow = new bigDecimal('1000000');

    let usdlFrozen;
    if (
      accoutOnChain.account_resource?.frozen_balance_for_power?.frozen_balance
    ) {
      usdlFrozen = new bigDecimal(
        accoutOnChain.account_resource.frozen_balance_for_power.frozen_balance,
      ).divide(pow, bigDecimal.RoundingModes.UNNECESSARY);
    } else {
      usdlFrozen = new bigDecimal('0');
    }

    const usdlAvailable = new bigDecimal(accoutOnChain.balance).divide(
      pow,
      bigDecimal.RoundingModes.UNNECESSARY,
    );
    const usdlTotal = usdlAvailable.add(usdlFrozen);

    return {
      name: accoutOnChain.account_name,
      address: account.address,
      firstSeenAtDate: account.firstSeenAtDate,
      firstSeenAtBlock: account.firstSeenAtBlock,
      usdlAvailable,
      usdlFrozen,
      usdlTotal,
      assets,
    };
  }

  public async getAccount(address: string) {
    const account = await this.accountModel.findOne({ address }).exec();

    const transactions = await this.transactionService.findByAddress(address);
    account.transactions = transactions;
    return account;
  }

  public async getAccountFromChain(address: string) {
    const accountChain = await this.lgcyService.getAccount(address);

    if (accountChain?.account_name) {
      accountChain.account_name = this.lgcyService.hexToUtf8(
        accountChain.account_name,
      );
    }

    if (accountChain?.address) {
      accountChain.address = this.lgcyService.hexToBase58(accountChain.address);
    }
    return accountChain;
  }

  public async getAccountSingle(address: string) {
    return await this.accountModel.findOne({ address }).exec();
  }

  public async save(account: Account) {
    return this.accountModel.findOneAndUpdate(
      { address: account.address },
      account,
      {
        upsert: true,
      },
    );
  }

  public createAccountByTransaction(address: string, transaction: Transaction) {
    return {
      address,
      usdlBalance: '0',
      firstSeenAtBlock: transaction.blockNumber,
      firstSeenAtDate: transaction.timestamp,
    };
  }

  public createAccount(
    address: string,
    firstSeenAtBlock: number,
    firstSeenAtDate: Date,
  ): Account {
    return {
      address,
      firstSeenAtDate,
      firstSeenAtBlock,
    };
  }

  public async calcLrcTransfer(
    sender: string,
    receiver: string,
    tokenId: string,
    amount: bigDecimal,
    blockNumber: number,
    blockTimestamp: Date,
  ) {
    let senderAccount: Account;
    let tokenBalanceSender: bigDecimal;

    if (sender) {
      senderAccount = await this.accountModel
        .findOne({
          address: sender,
        })
        .exec();

      if (!senderAccount) {
        senderAccount = this.createAccount(sender, blockNumber, blockTimestamp);
      }
      if (!senderAccount.tokenBalances) {
        senderAccount.tokenBalances = {};
      }
      if (!senderAccount.tokenBalances[tokenId]) {
        senderAccount.tokenBalances[tokenId] = new bigDecimal(0);
      }
      tokenBalanceSender = new bigDecimal(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        senderAccount.tokenBalances[tokenId].value,
      );
    }

    let receiverAccount: Account = await this.accountModel
      .findOne({
        address: receiver,
      })
      .exec();
    if (!receiverAccount) {
      receiverAccount = this.createAccount(
        receiver,
        blockNumber,
        blockTimestamp,
      );
    }

    if (!receiverAccount.tokenBalances) {
      receiverAccount.tokenBalances = {};
    }
    if (!receiverAccount.tokenBalances[tokenId]) {
      receiverAccount.tokenBalances[tokenId] = new bigDecimal('0');
    }

    let tokenBalanceReceiver = new bigDecimal(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      receiverAccount.tokenBalances[tokenId].value,
    );

    if (sender) {
      tokenBalanceSender = tokenBalanceSender.subtract(amount);
      senderAccount.tokenBalances[tokenId] = tokenBalanceSender;
      await this.updateTokenBalance(
        senderAccount.address,
        senderAccount.tokenBalances,
      );
    }
    tokenBalanceReceiver = tokenBalanceReceiver.add(amount);
    receiverAccount.tokenBalances[tokenId] = tokenBalanceReceiver;

    await this.updateTokenBalance(
      receiverAccount.address,
      receiverAccount.tokenBalances,
    );
  }

  public async updateTokenBalance(
    address: string,
    tokenBalance: { [key: string]: bigDecimal },
  ) {
    await this.accountModel
      .updateOne(
        {
          address,
        },
        {
          $set: {
            tokenBalances: tokenBalance,
          },
        },
      )
      .exec();
  }

  public createGenesisWallet(address: string, balance: bigDecimal) {
    return {
      address,
      usdlBalance: new Schema.Types.Decimal128(balance.getValue()),
      firstSeenAtBlock: -1,
      firstSeenAtDate: new Date(0),
    };
  }

  public async getPage(
    skip: number,
    pageSize: number,
    sortField: string,
    sortOrder: number,
  ) {
    const totalRecords = await this.accountModel.count().exec();

    const sort = {};
    sort[sortField] = sortOrder;

    const accounts = await this.accountModel
      .find()
      .skip(skip)
      .sort(sort)
      .limit(pageSize)
      .exec();

    return {
      totalRecords,
      accounts: this.mapAccountsForHttpResponse(accounts),
    };
  }

  public mapAccountForHttpResponse(account: Account) {
    const accountProjection: any = JSON.parse(JSON.stringify(account));
    if (account.usdlBalance) {
      accountProjection.usdlBalance = NumberConverter.decimal128ToBigDecimal(
        account.usdlBalance,
      );
    }
    return accountProjection;
  }

  public mapAccountsForHttpResponse(accounts: Account[]) {
    return accounts.map((e) => this.mapAccountForHttpResponse(e));
  }
}
