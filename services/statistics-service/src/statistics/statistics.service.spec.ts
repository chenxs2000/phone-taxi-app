import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyStatistics } from './entities/daily-statistics.entity';
import { NotFoundException } from '@nestjs/common';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let dailyStatisticsModel: Model<DailyStatistics>;

  const mockDailyStats = {
    date: '2024-01-01',
    totalOrders: 100,
    completedOrders: 95,
    cancelledOrders: 5,
    timeoutOrders: 0,
    newUsers: 10,
    activeUsers: 80,
    activeDrivers: 50,
    totalTrips: 100,
    totalRevenue: 5000,
    cashRevenue: 2000,
    accountRevenue: 2500,
    deputyRevenue: 500,
    totalPayments: 100,
    successfulPayments: 98,
    refundedPayments: 2,
    refundedAmount: 100,
    totalCalls: 20,
    connectedCalls: 18,
    totalCallDuration: 1800,
    totalNotifications: 500,
    sentNotifications: 490,
    failedNotifications: 10,
    orderTypeDistribution: {
      instant: 80,
      booking: 15,
      urgent: 5,
    },
    carTypeDistribution: {
      normal: 70,
      comfort: 25,
      accessible: 5,
    },
    hourlyDistribution: new Array(24).fill(5),
  };

  const mockQuery = {
    exec: jest.fn().mockResolvedValue([]),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
  };

  // 创建一个模拟的 Model 构造函数
  const MockModel = jest.fn().mockImplementation(() => {
    return mockDailyStats;
  }) as any;

  // 添加 Model 的方法到 MockModel
  MockModel.find = jest.fn().mockReturnValue(mockQuery);
  MockModel.findOne = jest.fn().mockResolvedValue(null);
  MockModel.countDocuments = jest.fn().mockResolvedValue(0);
  MockModel.save = jest.fn().mockResolvedValue(mockDailyStats);

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getModelToken(DailyStatistics.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    dailyStatisticsModel = module.get<Model<DailyStatistics>>(getModelToken(DailyStatistics.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOverview', () => {
    it('should return overview statistics', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);

      const result = await service.getOverview({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('trends');
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard statistics', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);
      MockModel.findOne.mockResolvedValue(mockDailyStats);

      const result = await service.getDashboard({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('today');
      expect(result).toHaveProperty('yesterday');
      expect(result).toHaveProperty('week');
    });
  });

  describe('getOrderStatistics', () => {
    it('should return order statistics', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);

      const result = await service.getOrderStatistics({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalOrders');
      expect(result).toHaveProperty('completedOrders');
      expect(result).toHaveProperty('completionRate');
    });
  });

  describe('getOrderTrend', () => {
    it('should return order trend', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);

      const result = await service.getOrderTrend({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('trend');
      expect(Array.isArray(result.trend)).toBe(true);
    });
  });

  describe('getUserStatistics', () => {
    it('should return user statistics', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);

      const result = await service.getUserStatistics({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('newUsers');
      expect(result).toHaveProperty('activeUsers');
    });
  });

  describe('getUserGrowth', () => {
    it('should return user growth', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);

      const result = await service.getUserGrowth({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('growth');
      expect(Array.isArray(result.growth)).toBe(true);
    });
  });

  describe('getDriverStatistics', () => {
    it('should return driver statistics', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);

      const result = await service.getDriverStatistics({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('activeDrivers');
      expect(result).toHaveProperty('totalTrips');
    });
  });

  describe('getRevenueStatistics', () => {
    it('should return revenue statistics', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);

      const result = await service.getRevenueStatistics({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('revenueDistribution');
    });
  });

  describe('getRevenueTrend', () => {
    it('should return revenue trend', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);

      const result = await service.getRevenueTrend({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('trend');
      expect(Array.isArray(result.trend)).toBe(true);
    });
  });

  describe('getPaymentStatistics', () => {
    it('should return payment statistics', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);

      const result = await service.getPaymentStatistics({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalPayments');
      expect(result).toHaveProperty('successRate');
    });
  });

  describe('getCallStatistics', () => {
    it('should return call statistics', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);

      const result = await service.getCallStatistics({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalCalls');
      expect(result).toHaveProperty('connectedCalls');
      expect(result).toHaveProperty('averageCallDuration');
    });
  });

  describe('getNotificationStatistics', () => {
    it('should return notification statistics', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);

      const result = await service.getNotificationStatistics({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalNotifications');
      expect(result).toHaveProperty('successRate');
    });
  });

  describe('getHourlyStatistics', () => {
    it('should return hourly statistics', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);

      const result = await service.getHourlyStatistics({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('hourly');
      expect(Array.isArray(result.hourly)).toBe(true);
      expect(result.hourly.length).toBe(24);
      expect(result).toHaveProperty('peakHour');
    });
  });

  describe('getDailyStatistics', () => {
    it('should return daily statistics', async () => {
      mockQuery.exec.mockResolvedValue([mockDailyStats]);

      const result = await service.getDailyStatistics({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('list');
      expect(result).toHaveProperty('total');
    });
  });

  describe('getDailyStatisticsByDate', () => {
    it('should return statistics for a specific date', async () => {
      MockModel.findOne.mockResolvedValue(mockDailyStats);

      const result = await service.getDailyStatisticsByDate('2024-01-01');
      expect(result).toBeDefined();
      expect(result.date).toBe('2024-01-01');
    });

    it('should throw NotFoundException if date not found', async () => {
      MockModel.findOne.mockResolvedValue(null);
      await expect(service.getDailyStatisticsByDate('9999-12-31')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
