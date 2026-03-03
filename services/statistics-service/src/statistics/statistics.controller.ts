import {
  Controller,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { QueryStatisticsDto } from './dto/query-statistics.dto';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'statistics-service' };
  }

  // ==================== 综合统计 ====================

  @Get('overview')
  async getOverview(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getOverview(query);
  }

  @Get('dashboard')
  async getDashboard(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getDashboard(query);
  }

  // ==================== 订单统计 ====================

  @Get('orders')
  async getOrderStatistics(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getOrderStatistics(query);
  }

  @Get('orders/trend')
  async getOrderTrend(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getOrderTrend(query);
  }

  // ==================== 用户统计 ====================

  @Get('users')
  async getUserStatistics(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getUserStatistics(query);
  }

  @Get('users/growth')
  async getUserGrowth(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getUserGrowth(query);
  }

  // ==================== 司机统计 ====================

  @Get('drivers')
  async getDriverStatistics(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getDriverStatistics(query);
  }

  @Get('drivers/performance')
  async getDriverPerformance(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getDriverPerformance(query);
  }

  // ==================== 收入统计 ====================

  @Get('revenue')
  async getRevenueStatistics(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getRevenueStatistics(query);
  }

  @Get('revenue/trend')
  async getRevenueTrend(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getRevenueTrend(query);
  }

  // ==================== 支付统计 ====================

  @Get('payments')
  async getPaymentStatistics(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getPaymentStatistics(query);
  }

  @Get('payments/distribution')
  async getPaymentDistribution(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getPaymentDistribution(query);
  }

  // ==================== 通话统计 ====================

  @Get('calls')
  async getCallStatistics(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getCallStatistics(query);
  }

  // ==================== 通知统计 ====================

  @Get('notifications')
  async getNotificationStatistics(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getNotificationStatistics(query);
  }

  // ==================== 时段分析 ====================

  @Get('hourly')
  async getHourlyStatistics(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getHourlyStatistics(query);
  }

  // ==================== 日志统计 ====================

  @Get('daily')
  async getDailyStatistics(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getDailyStatistics(query);
  }

  @Get('daily/:date')
  async getDailyStatisticsByDate(@Param('date') date: string) {
    return this.statisticsService.getDailyStatisticsByDate(date);
  }

  // ==================== 导出报表 ====================

  @Get('export/excel')
  async exportToExcel(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.exportToExcel(query);
  }

  @Get('export/pdf')
  async exportToPdf(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.exportToPdf(query);
  }
}
