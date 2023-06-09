import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlockSyncerService } from './jobs/block-syncer.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { LgcyService } from './services/lgcy.service';
import { BlockService } from './services/block.service';
import { Block, BlockSchema } from './schemas/block.schema';
import { TransactionService } from './services/transaction.service';
import { Transaction, TransactionSchema } from './schemas/Transaction';
import { AccountController } from './controllers/AccountController';
import { TransactionController } from './controllers/TransactionController';
import { TransactionInfoSyncerService } from './jobs/transaction-info-syncer.service';
import { HttpModule } from '@nestjs/axios';
import { DashboardController } from "./controllers/DashboardController";
import { DashboardService } from "./services/DashboardService";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot('mongodb://127.0.0.1/supernest'),
    MongooseModule.forFeature([
      { name: Block.name, schema: BlockSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    HttpModule,
  ],
  controllers: [
    AppController,
    AccountController,
    TransactionController,
    DashboardController,
  ],
  providers: [
    AppService,
    BlockSyncerService,
    TransactionInfoSyncerService,
    LgcyService,
    BlockService,
    TransactionService,
    DashboardService,
  ],
})
export class AppModule {}
