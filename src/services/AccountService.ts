import { Injectable, Logger } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Account } from '../model/Account';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Types } from 'mongoose';
import { Transaction } from '../model/Transaction';
import bigDecimal = require('js-big-decimal');
import { AccountProjection } from '../model/projections/AccountProjection';
import { NumberConverter } from '../utils/NumberConverter';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private transactionService: TransactionService,
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
  ) {}

  public createAccountProjection(
    account: Account,
    assets: { symbol: string; value: bigDecimal }[],
  ): AccountProjection {
    return {
      address: account.address,
      firstSeenAtDate: account.firstSeenAtDate,
      firtSeenAtBlock: account.firstSeenAtBlock,
      usdlBalance: new bigDecimal(account.usdlBalance.toString()),
      assets,
    };
  }

  public async getAccount(address: string) {
    const account = await this.accountModel.findOne({ address }).exec();

    const transactions = await this.transactionService.findByAddress(address);
    account.transactions = transactions;
    return account;
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

  public createAccount(address: string, transaction: Transaction) {
    return {
      address,
      usdlBalance: '0',
      firstSeenAtBlock: transaction.blockNumber,
      firstSeenAtDate: transaction.timestamp,
    };
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
