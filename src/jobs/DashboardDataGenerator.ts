import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry, Timeout } from "@nestjs/schedule";
import * as process from 'process';
import { DashboardDataService } from '../services/dashboard-data.service';
import { BlockService } from '../services/block.service';
import { DashboardData } from '../model/DashboardData';

@Injectable()
export class DashboardDataGenerator {
  private readonly logger = new Logger(DashboardDataGenerator.name);
  private static jobTimeout = 500;

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private dashboardDataService: DashboardDataService,
    private blockService: BlockService,
  ) {}

  // @Cron(CronExpression.EVERY_5_SECONDS)
  @Timeout('dashboardDataTimeout', DashboardDataGenerator.jobTimeout)
  public async createDashboardData() {
    const blocks = await this.blockService.findWithoutDashboardData(10);
    this.logger.debug(
      'Found ' + blocks.length + ' blocks to generate DashboardData',
    );
    for (const block of blocks) {
      await this.dashboardDataService.save(
        await this.dashboardDataService.getDashboardDataAtBlock(block),
      );
      await this.blockService.setParserInfo(block, 'dashboardData', true);
    }

    this.schedulerRegistry.deleteTimeout('dashboardDataTimeout');
    this.schedulerRegistry.addTimeout(
      'dashboardDataTimeout',
      setTimeout(async () => {
        await this.createDashboardData();
      }, DashboardDataGenerator.jobTimeout),
    );
  }
}
