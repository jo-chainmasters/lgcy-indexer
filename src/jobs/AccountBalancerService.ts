import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { TransactionService } from '../services/transaction.service';
import { AccountService } from '../services/AccountService';
import bigDecimal = require('js-big-decimal');
import { Account } from '../model/Account';
import { Schema } from 'mongoose';
import { TransactionType } from '../model/TransactionType';
import { Transaction } from '../model/Transaction';

@Injectable()
export class AccountBalancerService {
  private readonly logger = new Logger(AccountBalancerService.name);

  public static GENESIS_ZION_ADDRESS = 'Lej3aiBizytWgRUCHBYBAEcxsedfUwMML2';
  public static GENESIS_ZION_AMOUNT = new bigDecimal('95000000000000000');

  public static GENESIS_SUN_ADDRESS = 'LUyz7rvAAwZV6Qts1FSP5fRxxmfoHjSJkT';
  public static GENESIS_SUN_AMOUNT = new bigDecimal('5000000000000000');

  public static GENESIS_BLACKHOLE_ADDRESS =
    'LYPigtpVMTididDXw6o51RSnX8kJPzbdn4';
  public static GENESIS_BLACKHOLE_AMOUNT = new bigDecimal('0');

  public static GENESIS_USDL_ADDRESS = 'LYkwBR8gQGp3heu555TonYHMjj2S3ByJhU';
  public static GENESIS_USDL_AMOUNT = new bigDecimal('1000000000000000');

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
  ) {
    // Init ZION Account if it not exists
    this.accountService
      .getAccountSingle(AccountBalancerService.GENESIS_ZION_ADDRESS)
      .then((zionAccount) => {
        if (!zionAccount) {
          const zionAccount: Account = this.accountService.createGenesisWallet(
            AccountBalancerService.GENESIS_ZION_ADDRESS,
            AccountBalancerService.GENESIS_ZION_AMOUNT,
          );
          this.accountService.save(zionAccount).then();
        }
      });

    // Init Sun Account if it not exists
    this.accountService
      .getAccountSingle(AccountBalancerService.GENESIS_SUN_ADDRESS)
      .then((sunAccount) => {
        if (!sunAccount) {
          const sunAccount: Account = this.accountService.createGenesisWallet(
            AccountBalancerService.GENESIS_SUN_ADDRESS,
            AccountBalancerService.GENESIS_SUN_AMOUNT,
          );
          this.accountService.save(sunAccount).then();
        }
      });

    // Init Blackhole Account if it not exists
    this.accountService
      .getAccountSingle(AccountBalancerService.GENESIS_BLACKHOLE_ADDRESS)
      .then((blackHoleAccount) => {
        if (!blackHoleAccount) {
          const blackHoleAccount: Account =
            this.accountService.createGenesisWallet(
              AccountBalancerService.GENESIS_BLACKHOLE_ADDRESS,
              AccountBalancerService.GENESIS_BLACKHOLE_AMOUNT,
            );
          this.accountService.save(blackHoleAccount).then();
        }
      });

    // Init USDL Account if it not exists
    this.accountService
      .getAccountSingle(AccountBalancerService.GENESIS_USDL_ADDRESS)
      .then((usdlAccount) => {
        if (!usdlAccount) {
          const usdlAccount: Account = this.accountService.createGenesisWallet(
            AccountBalancerService.GENESIS_USDL_ADDRESS,
            AccountBalancerService.GENESIS_USDL_AMOUNT,
          );
          this.accountService.save(usdlAccount).then();
        }
      });
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  public async doBalancing() {
    const transactions = await this.transactionService.findWithoutBalancing(
      1000,
    );

    if (transactions.length > 0)
      this.logger.debug('Found ' + transactions.length + ' for accounting');

    for (const transaction of transactions) {
      let accountSender: any = await this.accountService.getAccountSingle(
        transaction.sender,
      );

      if (!accountSender) {
        accountSender = this.accountService.createAccount(
          transaction.sender,
          transaction,
        );
      }

      // if(transaction.sender === "LTHJeXaPGwR533Hb36KcVvTKnrMpZdmk39" || transaction.receiver === "LTHJeXaPGwR533Hb36KcVvTKnrMpZdmk39") {
      //   this.logger.debug("transaction: " + transaction.hash);
      //   this.logger.debug('Sender: ' + transaction.sender + ': ' + accountSender.usdlBalance.toString());
      // }

      let usdlBalanceSender = new bigDecimal(
        accountSender.usdlBalance.toString(),
      );
      usdlBalanceSender = usdlBalanceSender.subtract(
        new bigDecimal(transaction.fee),
      );

      // let tmp;
      if (
        transaction.type === TransactionType.TransferContract &&
        transaction.successfull
      ) {
        // if(transaction.sender === "LTHJeXaPGwR533Hb36KcVvTKnrMpZdmk39" || transaction.receiver === "LTHJeXaPGwR533Hb36KcVvTKnrMpZdmk39") {
        //   this.logger.debug(transaction.sender + ' -> ' + transaction.receiver + ": " + transaction.amount.toString());
        // }

        const sendAmount = new bigDecimal(transaction.amount.toString());
        usdlBalanceSender = usdlBalanceSender.subtract(sendAmount);

        let accountReceiver: any = await this.accountService.getAccountSingle(
          transaction.receiver,
        );
        if (!accountReceiver) {
          accountReceiver = this.accountService.createAccount(
            transaction.receiver,
            transaction,
          );
        }

        // if(transaction.sender === "LTHJeXaPGwR533Hb36KcVvTKnrMpZdmk39" || transaction.receiver === "LTHJeXaPGwR533Hb36KcVvTKnrMpZdmk39") {
        //   this.logger.debug('Receiver: '  + accountReceiver.usdlBalance.toString());
        // }

        let usdlBalanceReceiver = new bigDecimal(
          accountReceiver.usdlBalance.toString(),
        );
        usdlBalanceReceiver = usdlBalanceReceiver.add(
          new bigDecimal(transaction.amount.toString()),
        );
        accountReceiver.usdlBalance = usdlBalanceReceiver.getValue();

        // tmp = accountReceiver.usdlBalance;
        await this.accountService.save(accountReceiver);
      }

      if (
        transaction.type === TransactionType.WithdrawBalanceContract &&
        transaction.successfull
      ) {
        usdlBalanceSender = usdlBalanceSender.add(
          new bigDecimal(transaction.transactionInfo.withdrawAmount.toString()),
        );
      }

      accountSender.usdlBalance = new Schema.Types.Decimal128(
        usdlBalanceSender.getValue(),
      );

      // if(transaction.sender === "LTHJeXaPGwR533Hb36KcVvTKnrMpZdmk39" || transaction.receiver === "LTHJeXaPGwR533Hb36KcVvTKnrMpZdmk39") {
      //   this.logger.debug('Sender: ' + transaction.sender + ': ' + accountSender.usdlBalance.toString());
      //   if (tmp) this.logger.debug('Receiver: ' + transaction.receiver + ': ' + tmp.toString());
      // }

      await this.accountService.save(accountSender);
      await this.transactionService.setParserInfo(
        transaction,
        'usdlBalancing',
        true,
      );
    }
  }
}
