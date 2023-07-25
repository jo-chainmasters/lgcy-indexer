import { Controller, Get, Logger } from '@nestjs/common';
import { DashboardDataService } from '../services/dashboard-data.service';

@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private dashboardDataService: DashboardDataService) {}

  @Get()
  public async getDashboardData() {
    // return await this.dashboardDataService.findLast();
    return await this.dashboardDataService.getDashboardDataAtCurrentBlock();
  }
}
