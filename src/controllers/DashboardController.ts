import { Controller, Get, Logger } from '@nestjs/common';
import { DashboardService } from '../services/DashboardService';

@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private dashboardService: DashboardService) {}

  @Get()
  public async getDashboardData() {
    return await this.dashboardService.getDashboardData();
  }
}
