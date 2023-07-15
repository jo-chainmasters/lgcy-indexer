import { Injectable, Logger } from '@nestjs/common';
import {
  Cron,
  CronExpression,
  Interval,
  SchedulerRegistry,
  Timeout,
} from '@nestjs/schedule';
import { BlockService } from '../services/block.service';
import { TransactionService } from '../services/transaction.service';
import { Block } from '../model/block.schema';
import { Transaction } from '../model/Transaction';

@Injectable()
export class BlockSyncerService {
  private readonly logger = new Logger(BlockSyncerService.name);

  private static jobTimeout = 500;

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private blockService: BlockService,
    private transactionService: TransactionService,
  ) {}

  // @Cron(CronExpression.EVERY_SECOND, { name: 'blockSyncer' })
  // @Interval(5000)
  @Timeout('blockSyncerTimeout', BlockSyncerService.jobTimeout)
  public async syncBlocks() {
    const lastBlock = await this.blockService.findLast();
    let nextNumber = 1;
    if (lastBlock !== null) {
      nextNumber = lastBlock.number + 1;
    }

    try {
      const blockList: { block: Block; transactions: Transaction[] }[] =
        await this.blockService.getBlockRange(nextNumber, 50);

      const allBlocks: Block[] = [];
      const allTransactions: Transaction[] = [];
      for (const block of blockList) {
        if (block.block.number % 1000 === 0)
          this.logger.debug('Processing Block #' + block.block.number);
        allBlocks.push(block.block);
        allTransactions.push(...block.transactions);
      }
      await this.blockService.saveAll(allBlocks);
      await this.transactionService.insertAll(allTransactions);
    } catch (e) {
      this.logger.error(e + ': ' + nextNumber);
    }

    this.schedulerRegistry.deleteTimeout('blockSyncerTimeout');
    this.schedulerRegistry.addTimeout(
      'blockSyncerTimeout',
      setTimeout(async () => {
        await this.syncBlocks();
      }, BlockSyncerService.jobTimeout),
    );
  }
}
