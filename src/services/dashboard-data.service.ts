import { Injectable, Logger } from '@nestjs/common';
import { DashboardData } from '../model/DashboardData';
import { BlockService } from './block.service';
import { TransactionService } from './transaction.service';
import { Block } from '../model/block.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DashboardDataService {
  private readonly logger = new Logger(DashboardDataService.name);

  constructor(
    @InjectModel(DashboardData.name)
    private readonly dashboardDataModel: Model<DashboardData>,
    private blockService: BlockService,
    private transactionService: TransactionService,
  ) {}

  public async findLast() {
    return await this.dashboardDataModel
      .findOne()
      .sort({ currentBlock: -1 })
      .limit(1)
      .exec();
  }

  public async getDashboardDataAtCurrentBlock() {
    const currentBlock = await this.blockService.findLast();
    return this.getDashboardDataAtBlock(currentBlock);
  }

  public async saveAll(dashboardDatas: DashboardData[]) {
    return await this.dashboardDataModel.insertMany(dashboardDatas);
  }

  public async save(dashboardData: DashboardData) {
    await this.dashboardDataModel.insertMany([dashboardData]);
  }

  public async getDashboardDataAtBlockNumber(blockNumber: number) {
    const block = await this.blockService.findByNumber(blockNumber);
    return this.getDashboardDataAtBlock(block);
  }

  public async getDashboardDataAtBlock(block: Block) {
    const currentBlock = block.number;
    const totalTransactions =
      '' +
      (await this.transactionService.countTransactionsBlockRange(
        1,
        block.number,
      ));
    const totalAccounts = 'TODO';
    const totalNodes = 'TODO';
    const frozenLgcy = 'TODO';

    return new DashboardData(
      currentBlock,
      totalTransactions,
      totalAccounts,
      totalNodes,
      frozenLgcy,
      this.getHourLabels(24, block.timestamp),
      await this.getHourData(24, block.timestamp),
      this.getDayLabels(7, block.timestamp),
      await this.getDayData(7, block.timestamp),
    );
  }

  private getHourLabels(count: number, from: Date): string[] {
    const arr: string[] = [];
    const millisOneHour = 60 * 60 * 1000;
    let oldDate = from;
    for (let i = 0; i <= count - 1; i++) {
      const newDate = new Date(oldDate.valueOf() - millisOneHour);
      arr.push(this.getHourString(oldDate, newDate));
      oldDate = newDate;
    }
    return arr.reverse();
  }

  private getDayLabels(count: number, from: Date): string[] {
    const arr: string[] = [];

    const millis1day = 24 * 60 * 60 * 1000;
    let oldDate = from;
    for (let i = 0; i <= count - 1; i++) {
      arr.push(this.getDayString(oldDate));
      const newDate = new Date(oldDate.valueOf() - millis1day);
      oldDate = newDate;
    }
    return arr.reverse();
  }

  private async getHourData(count: number, from: Date): Promise<number[]> {
    const arr: number[] = [];
    const millisOneHour = 60 * 60 * 1000;
    let oldDate = from;
    for (let i = 0; i <= count - 1; i++) {
      const newDate = new Date(oldDate.valueOf() - millisOneHour);
      const result = await this.transactionService.countTransactionsTimeRange(
        newDate,
        oldDate,
      );
      arr.push(result);
      oldDate = newDate;
    }

    return arr.reverse();
  }

  private async getDayData(count: number, from: Date): Promise<number[]> {
    const arr: number[] = [];

    let dateStart = new Date(from);
    dateStart.setHours(0, 0, 0, 0);

    let dateEnd = new Date(from);
    dateEnd.setHours(23, 59, 59, 999);

    const millisSevenDays = 24 * 60 * 60 * 1000;
    for (let i = 0; i <= count - 1; i++) {
      // this.logger.debug('Start: ' + dateStart.toISOString() + ' End: ' + dateEnd.toISOString());
      const result = await this.transactionService.countTransactionsTimeRange(
        dateStart,
        dateEnd,
      );
      arr.push(result);

      const newDateStart = new Date(dateStart.valueOf() - millisSevenDays);
      const newDateEnd = new Date(dateEnd.valueOf() - millisSevenDays);

      dateStart = newDateStart;
      dateEnd = newDateEnd;
    }

    return arr.reverse();
  }

  private getHourString(oldDate: Date, newDate: Date): string {
    let oldHours = '' + oldDate.getHours();
    let oldMinutes = '' + oldDate.getMinutes();
    if (oldHours.length === 1) oldHours = '0' + oldHours;
    if (oldMinutes.length === 1) oldMinutes = '0' + oldMinutes;

    let newHours = '' + newDate.getHours();
    let newMinutes = '' + newDate.getMinutes();
    if (newHours.length === 1) newHours = '0' + newHours;
    if (newMinutes.length === 1) newMinutes = '0' + newMinutes;

    return newHours + ':' + newMinutes + ' - ' + oldHours + ':' + oldMinutes;
  }

  private getDayString(date: Date): string {
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    if (month.length === 1) month = '0' + month;
    if (day.length === 1) day = '0' + day;

    return date.getFullYear() + '-' + month + '-' + day;
  }
}
