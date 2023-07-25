import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlockSyncerService } from './jobs/block-syncer.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { LgcyService } from './services/lgcy.service';
import { BlockService } from './services/block.service';
import { Block, BlockSchema } from './model/block.schema';
import { TransactionService } from './services/transaction.service';
import { Transaction, TransactionSchema } from './model/Transaction';
import { AccountController } from './controllers/AccountController';
import { TransactionController } from './controllers/TransactionController';
import { TransactionInfoSyncerService } from './jobs/transaction-info-syncer.service';
import { HttpModule } from '@nestjs/axios';
import { DashboardController } from './controllers/DashboardController';
import { DashboardDataService } from './services/dashboard-data.service';
import { AccountService } from './services/AccountService';
import { SmartContractParserService } from './jobs/smart-contract-parser.service';
import { SmartContract, SmartContractSchema } from './model/SmartContract';
import { SmartContractService } from './services/SmartContractService';
import { SmartContractController } from './controllers/SmartContractController';
import { DebugJobService } from './jobs/DebugJob.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

import configurationProd from '../configs/prod';
import configurationDev from '../configs/dev';
import { TriggerSmartContractAnalyzer } from './jobs/trigger-smart-contract-analyzer.service';
import { AccountBalancerService } from './jobs/AccountBalancerService';
import { Account, AccountSchema } from './model/Account';
import { ContractCallService } from './services/ContractCallService';
import { ContractCall, ContractCallSchema } from './model/ContractCall';
import { DashboardData, DashboardDataSchema } from "./model/DashboardData";
import { DashboardDataGenerator } from "./jobs/DashboardDataGenerator";

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [ENV === 'prod' ? configurationProd : configurationDev],
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot('mongodb://127.0.0.1/supernest-v2'),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (config: ConfigService) => ({
    //     uri: config.get('database.uri'),
    //     family: 6,
    //   }),
    //   inject: [ConfigService],
    // }),
    MongooseModule.forFeature([
      { name: Block.name, schema: BlockSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: SmartContract.name, schema: SmartContractSchema },
      { name: Account.name, schema: AccountSchema },
      { name: ContractCall.name, schema: ContractCallSchema },
      { name: DashboardData.name, schema: DashboardDataSchema },
    ]),
    HttpModule,
  ],
  controllers: [
    AppController,
    AccountController,
    TransactionController,
    DashboardController,
    SmartContractController,
  ],
  providers: [
    AppService,
    BlockSyncerService,
    TransactionInfoSyncerService,
    LgcyService,
    BlockService,
    TransactionService,
    DashboardDataService,
    AccountService,
    SmartContractParserService,
    SmartContractService,
    DebugJobService,
    TriggerSmartContractAnalyzer,
    AccountBalancerService,
    ContractCallService,
    DashboardDataGenerator,
  ],
})
export class AppModule {}
