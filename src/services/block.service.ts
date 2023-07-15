import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Block } from '../model/block.schema';
import { Model } from 'mongoose';
import { LgcyService } from './lgcy.service';
import { TransactionService } from './transaction.service';
import { Transaction } from '../model/Transaction';

@Injectable()
export class BlockService {
  constructor(
    @InjectModel(Block.name) private readonly blockModel: Model<Block>,
    private lgcyService: LgcyService,
    private transactionService: TransactionService,
  ) {}

  public async save(block: Block): Promise<void> {
    await this.blockModel.create(block);
  }

  public async saveAll(blocks: Block[]): Promise<void> {
    await this.blockModel.insertMany(blocks);
  }

  public async findLast(): Promise<Block> {
    return this.blockModel.findOne().sort({ number: -1 }).limit(1).exec();
  }

  public async getBlockByNumber(
    num: number,
  ): Promise<{ block: Block; transactions: Transaction[] }> {
    const blockHttp = await this.lgcyService.getBlockByNumber(num);
    const block = this.mapBlock(blockHttp);
    const transactions: Transaction[] = [];
    if (blockHttp.transactions && (blockHttp.transactions as []).length > 0) {
      for (const transactionHttp of blockHttp.transactions as []) {
        const transaction = this.transactionService.mapTransaction(
          transactionHttp,
          block.number,
          block.timestamp,
        );
        transactions.push(transaction);
      }
    }
    return { block, transactions };
  }

  public async getBlockRange(
    num: number,
    count = 50,
  ): Promise<{ block: Block; transactions: Transaction[] }[]> {
    const blocksHttp = await this.lgcyService.getBlockRange(num, count);
    const blocks: { block: Block; transactions: Transaction[] }[] = [];

    for (const blocksHttpElement of blocksHttp) {
      const block = this.mapBlock(blocksHttpElement);
      const transactions: Transaction[] = [];
      if (
        blocksHttpElement.transactions &&
        (blocksHttpElement.transactions as []).length > 0
      ) {
        for (const transactionHttp of blocksHttpElement.transactions as []) {
          const transaction = this.transactionService.mapTransaction(
            transactionHttp,
            block.number,
            block.timestamp,
          );
          transactions.push(transaction);
        }
      }
      blocks.push({ block, transactions });
    }
    return blocks;
  }

  public mapBlock(block: any): Block {
    if (!block) return undefined;

    return {
      hash: block.blockID,
      parentHash: block.block_header.raw_data.parentHash,
      number: block.block_header.raw_data.number,
      timestamp: new Date(block.block_header.raw_data.timestamp * 1),
    };
  }
}
