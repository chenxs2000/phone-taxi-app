import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyStatistics } from './entities/daily-statistics.entity';
import { QueryStatisticsDto } from './dto/query-statistics.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(DailyStatistics.name) private dailyStatisticsModel: Model<DailyStatistics>,
  ) {}

  // ==================== 综合统计 ====================

  async getOverview(query: QueryStatisticsDto) {
    const { startDate, endDate, date } = query;

    if (date) {
      return this.getDailyStatisticsByDate(date);
    }

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    });
    const statistics = await statsQuery.exec();

    const overview = {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary: {
        totalOrders: this.sumField(statistics, 'totalOrders'),
        completedOrders: this.sumField(statistics, 'completedOrders'),
        totalRevenue: this.sumField(statistics, 'totalRevenue'),
        activeUsers: this.sumField(statistics, 'activeUsers'),
        activeDrivers: this.sumField(statistics, 'activeDrivers'),
      },
      trends: {
        orders: statistics.map((s) => ({ date: s.date, value: s.totalOrders })),
        revenue: statistics.map((s) => ({ date: s.date, value: s.totalRevenue })),
        users: statistics.map((s) => ({ date: s.date, value: s.activeUsers })),
      },
    };

    return overview;
  }

  async getDashboard(query: QueryStatisticsDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [todayStats, yesterdayStats, weekStats] = await Promise.all([
      this.dailyStatisticsModel.findOne({ date: todayStr }),
      this.dailyStatisticsModel.findOne({ date: yesterdayStr }),
      this.dailyStatisticsModel.find({
        date: { $gte: weekAgo.toISOString().split('T')[0], $lte: todayStr },
      }).exec(),
    ]);

    return {
      today: todayStats || this.getEmptyStats(todayStr),
      yesterday: yesterdayStats || this.getEmptyStats(yesterdayStr),
      week: {
        totalOrders: this.sumField(weekStats, 'totalOrders'),
        totalRevenue: this.sumField(weekStats, 'totalRevenue'),
        averageOrders: this.averageField(weekStats, 'totalOrders'),
        averageRevenue: this.averageField(weekStats, 'totalRevenue'),
      },
    };
  }

  // ==================== 订单统计 ====================

  async getOrderStatistics(query: QueryStatisticsDto) {
    const { startDate, endDate } = query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    });
    const statistics = await statsQuery.exec();

    return {
      totalOrders: this.sumField(statistics, 'totalOrders'),
      completedOrders: this.sumField(statistics, 'completedOrders'),
      cancelledOrders: this.sumField(statistics, 'cancelledOrders'),
      timeoutOrders: this.sumField(statistics, 'timeoutOrders'),
      completionRate: this.calculateRate(
        this.sumField(statistics, 'completedOrders'),
        this.sumField(statistics, 'totalOrders'),
      ),
      orderTypeDistribution: this.sumDistribution(statistics, 'orderTypeDistribution'),
      carTypeDistribution: this.sumDistribution(statistics, 'carTypeDistribution'),
    };
  }

  async getOrderTrend(query: QueryStatisticsDto) {
    const { startDate, endDate } = query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    }).sort({ date: 1 });
    const statistics = await statsQuery.exec();

    return {
      trend: statistics.map((s) => ({
        date: s.date,
        totalOrders: s.totalOrders,
        completedOrders: s.completedOrders,
        cancelledOrders: s.cancelledOrders,
      })),
    };
  }

  // ==================== 用户统计 ====================

  async getUserStatistics(query: QueryStatisticsDto) {
    const { startDate, endDate } = query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    });
    const statistics = await statsQuery.exec();

    return {
      newUsers: this.sumField(statistics, 'newUsers'),
      activeUsers: this.sumField(statistics, 'activeUsers'),
      averageActiveUsers: this.averageField(statistics, 'activeUsers'),
    };
  }

  async getUserGrowth(query: QueryStatisticsDto) {
    const { startDate, endDate } = query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    }).sort({ date: 1 });
    const statistics = await statsQuery.exec();

    let cumulativeUsers = 0;
    const growth = statistics.map((s) => {
      cumulativeUsers += s.newUsers;
      return {
        date: s.date,
        newUsers: s.newUsers,
        cumulativeUsers,
      };
    });

    return { growth };
  }

  // ==================== 司机统计 ====================

  async getDriverStatistics(query: QueryStatisticsDto) {
    const { startDate, endDate } = query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    });
    const statistics = await statsQuery.exec();

    return {
      activeDrivers: this.sumField(statistics, 'activeDrivers'),
      totalTrips: this.sumField(statistics, 'totalTrips'),
      averageTripsPerDriver: statistics.length > 0
        ? this.sumField(statistics, 'totalTrips') / this.sumField(statistics, 'activeDrivers')
        : 0,
    };
  }

  async getDriverPerformance(query: QueryStatisticsDto) {
    const { startDate, endDate } = query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    });
    const statistics = await statsQuery.exec();

    return {
      totalTrips: this.sumField(statistics, 'totalTrips'),
      activeDays: statistics.length,
      averageTripsPerDay: this.averageField(statistics, 'totalTrips'),
    };
  }

  // ==================== 收入统计 ====================

  async getRevenueStatistics(query: QueryStatisticsDto) {
    const { startDate, endDate } = query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    });
    const statistics = await statsQuery.exec();

    return {
      totalRevenue: this.sumField(statistics, 'totalRevenue'),
      cashRevenue: this.sumField(statistics, 'cashRevenue'),
      accountRevenue: this.sumField(statistics, 'accountRevenue'),
      deputyRevenue: this.sumField(statistics, 'deputyRevenue'),
      revenueDistribution: {
        cash: this.calculateRate(this.sumField(statistics, 'cashRevenue'), this.sumField(statistics, 'totalRevenue')),
        account: this.calculateRate(this.sumField(statistics, 'accountRevenue'), this.sumField(statistics, 'totalRevenue')),
        deputy: this.calculateRate(this.sumField(statistics, 'deputyRevenue'), this.sumField(statistics, 'totalRevenue')),
      },
    };
  }

  async getRevenueTrend(query: QueryStatisticsDto) {
    const { startDate, endDate } = query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    }).sort({ date: 1 });
    const statistics = await statsQuery.exec();

    return {
      trend: statistics.map((s) => ({
        date: s.date,
        totalRevenue: s.totalRevenue,
        cashRevenue: s.cashRevenue,
        accountRevenue: s.accountRevenue,
        deputyRevenue: s.deputyRevenue,
      })),
    };
  }

  // ==================== 支付统计 ====================

  async getPaymentStatistics(query: QueryStatisticsDto) {
    const { startDate, endDate } = query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    });
    const statistics = await statsQuery.exec();

    return {
      totalPayments: this.sumField(statistics, 'totalPayments'),
      successfulPayments: this.sumField(statistics, 'successfulPayments'),
      refundedPayments: this.sumField(statistics, 'refundedPayments'),
      refundedAmount: this.sumField(statistics, 'refundedAmount'),
      successRate: this.calculateRate(
        this.sumField(statistics, 'successfulPayments'),
        this.sumField(statistics, 'totalPayments'),
      ),
    };
  }

  async getPaymentDistribution(query: QueryStatisticsDto) {
    const revenueStats = await this.getRevenueStatistics(query);
    return revenueStats.revenueDistribution;
  }

  // ==================== 通话统计 ====================

  async getCallStatistics(query: QueryStatisticsDto) {
    const { startDate, endDate } = query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    });
    const statistics = await statsQuery.exec();

    return {
      totalCalls: this.sumField(statistics, 'totalCalls'),
      connectedCalls: this.sumField(statistics, 'connectedCalls'),
      totalCallDuration: this.sumField(statistics, 'totalCallDuration'),
      averageCallDuration: statistics.length > 0
        ? this.sumField(statistics, 'totalCallDuration') / this.sumField(statistics, 'connectedCalls')
        : 0,
      connectionRate: this.calculateRate(
        this.sumField(statistics, 'connectedCalls'),
        this.sumField(statistics, 'totalCalls'),
      ),
    };
  }

  // ==================== 通知统计 ====================

  async getNotificationStatistics(query: QueryStatisticsDto) {
    const { startDate, endDate } = query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    });
    const statistics = await statsQuery.exec();

    return {
      totalNotifications: this.sumField(statistics, 'totalNotifications'),
      sentNotifications: this.sumField(statistics, 'sentNotifications'),
      failedNotifications: this.sumField(statistics, 'failedNotifications'),
      successRate: this.calculateRate(
        this.sumField(statistics, 'sentNotifications'),
        this.sumField(statistics, 'totalNotifications'),
      ),
    };
  }

  // ==================== 时段分析 ====================

  async getHourlyStatistics(query: QueryStatisticsDto) {
    const { startDate, endDate } = query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    });
    const statistics = await statsQuery.exec();

    // 汇总所有天的小时分布
    const hourlyAggregation = new Array(24).fill(0);
    for (const stat of statistics) {
      if (stat.hourlyDistribution && Array.isArray(stat.hourlyDistribution)) {
        for (let i = 0; i < 24; i++) {
          hourlyAggregation[i] += stat.hourlyDistribution[i] || 0;
        }
      }
    }

    return {
      hourly: hourlyAggregation.map((count, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        count,
      })),
      peakHour: hourlyAggregation.indexOf(Math.max(...hourlyAggregation)),
    };
  }

  // ==================== 日志统计 ====================

  async getDailyStatistics(query: QueryStatisticsDto) {
    const { startDate, endDate } = query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const statsQuery = this.dailyStatisticsModel.find({
      date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] },
    }).sort({ date: -1 });
    const statistics = await statsQuery.exec();

    return {
      list: statistics,
      total: statistics.length,
    };
  }

  async getDailyStatisticsByDate(date: string) {
    const statistics = await this.dailyStatisticsModel.findOne({ date });
    if (!statistics) {
      throw new NotFoundException('该日期的统计数据不存在');
    }
    return statistics;
  }

  // ==================== 导出报表 ====================

  async exportToExcel(query: QueryStatisticsDto) {
    // TODO: 实现导出 Excel 功能
    // 可以使用 xlsx 库生成 Excel 文件
    return {
      success: true,
      message: '导出 Excel 功能待实现',
    };
  }

  async exportToPdf(query: QueryStatisticsDto) {
    // TODO: 实现导出 PDF 功能
    // 可以使用 pdfkit 库生成 PDF 文件
    return {
      success: true,
      message: '导出 PDF 功能待实现',
    };
  }

  // ==================== 私有辅助方法 ====================

  private sumField(statistics: any[], field: string): number {
    return statistics.reduce((sum, s) => sum + (s[field] || 0), 0);
  }

  private averageField(statistics: any[], field: string): number {
    if (statistics.length === 0) return 0;
    return this.sumField(statistics, field) / statistics.length;
  }

  private calculateRate(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return Math.round((numerator / denominator) * 10000) / 100; // 保留两位小数
  }

  private sumDistribution(statistics: any[], field: string): any {
    const result: any = {};
    for (const stat of statistics) {
      if (stat[field]) {
        for (const key of Object.keys(stat[field])) {
          result[key] = (result[key] || 0) + stat[field][key];
        }
      }
    }
    return result;
  }

  private getEmptyStats(date: string): any {
    return {
      date,
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      timeoutOrders: 0,
      newUsers: 0,
      activeUsers: 0,
      activeDrivers: 0,
      totalTrips: 0,
      totalRevenue: 0,
      cashRevenue: 0,
      accountRevenue: 0,
      deputyRevenue: 0,
      totalPayments: 0,
      successfulPayments: 0,
      refundedPayments: 0,
      refundedAmount: 0,
      totalCalls: 0,
      connectedCalls: 0,
      totalCallDuration: 0,
      totalNotifications: 0,
      sentNotifications: 0,
      failedNotifications: 0,
    };
  }
}
