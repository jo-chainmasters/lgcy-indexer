import { Injectable, Logger } from '@nestjs/common';
import { DashboardData } from '../model/projections/DashboardData';
import { BlockService } from './block.service';
import { TransactionService } from './transaction.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private blockService: BlockService,
    private transactionService: TransactionService,
  ) {}

  public async getDashboardData(): Promise<DashboardData> {
    const now = new Date();

    const lastBlock = await this.blockService.findLast();

    const currentBlock = '' + lastBlock.number;
    const totalTransactions =
      '' + (await this.transactionService.countTransactions());
    const totalAccounts = 'TODO';
    const totalNodes = 'TODO';
    const frozenLgcy = 'TODO';

    return new DashboardData(
      currentBlock,
      totalTransactions,
      totalAccounts,
      totalNodes,
      frozenLgcy,
      this.getHourLabels(12, now),
      this.getHourLabels(24, now),
      this.getHourLabels(36, now),
      this.getHourLabels(48, now),
      await this.getHourData(12, now),
      await this.getHourData(24, now),
      await this.getHourData(36, now),
      await this.getHourData(48, now),
      this.getDayLabels(7, now),
      this.getDayLabels(14, now),
      this.getDayLabels(21, now),
      this.getDayLabels(28, now),
      await this.getDayData(7, now),
      await this.getDayData(14, now),
      await this.getDayData(21, now),
      await this.getDayData(28, now),
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
