import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let service: StatisticsService;

  const mockStatisticsService = {
    getOverview: jest.fn(),
    getDashboard: jest.fn(),
    getOrderStatistics: jest.fn(),
    getOrderTrend: jest.fn(),
    getUserStatistics: jest.fn(),
    getUserGrowth: jest.fn(),
    getDriverStatistics: jest.fn(),
    getDriverPerformance: jest.fn(),
    getRevenueStatistics: jest.fn(),
    getRevenueTrend: jest.fn(),
    getPaymentStatistics: jest.fn(),
    getPaymentDistribution: jest.fn(),
    getCallStatistics: jest.fn(),
    getNotificationStatistics: jest.fn(),
    getHourlyStatistics: jest.fn(),
    getDailyStatistics: jest.fn(),
    getDailyStatisticsByDate: jest.fn(),
    exportToExcel: jest.fn(),
    exportToPdf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: mockStatisticsService,
        },
      ],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
    service = module.get<StatisticsService>(StatisticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();
      expect(result).toEqual({ status: 'ok', service: 'statistics-service' });
    });
  });

  describe('getOverview', () => {
    it('should return overview statistics', async () => {
      const mockOverview = {
        period: { start: new Date().toISOString(), end: new Date().toISOString() },
        summary: { totalOrders: 100, totalRevenue: 5000 },
        trends: { orders: [], revenue: [] },
      };

      mockStatisticsService.getOverview.mockResolvedValue(mockOverview);

      const result = await controller.getOverview({});
      expect(result).toBeDefined();
      expect(service.getOverview).toHaveBeenCalled();
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard statistics', async () => {
      const mockDashboard = {
        today: { totalOrders: 10 },
        yesterday: { totalOrders: 8 },
        week: { totalOrders: 60 },
      };

      mockStatisticsService.getDashboard.mockResolvedValue(mockDashboard);

      const result = await controller.getDashboard({});
      expect(result).toBeDefined();
      expect(service.getDashboard).toHaveBeenCalled();
    });
  });

  describe('getOrderStatistics', () => {
    it('should return order statistics', async () => {
      const mockStats = {
        totalOrders: 100,
        completedOrders: 95,
        completionRate: 95,
      };

      mockStatisticsService.getOrderStatistics.mockResolvedValue(mockStats);

      const result = await controller.getOrderStatistics({});
      expect(result).toBeDefined();
      expect(service.getOrderStatistics).toHaveBeenCalled();
    });
  });

  describe('getUserStatistics', () => {
    it('should return user statistics', async () => {
      const mockStats = {
        newUsers: 10,
        activeUsers: 80,
      };

      mockStatisticsService.getUserStatistics.mockResolvedValue(mockStats);

      const result = await controller.getUserStatistics({});
      expect(result).toBeDefined();
      expect(service.getUserStatistics).toHaveBeenCalled();
    });
  });

  describe('getDriverStatistics', () => {
    it('should return driver statistics', async () => {
      const mockStats = {
        activeDrivers: 50,
        totalTrips: 100,
      };

      mockStatisticsService.getDriverStatistics.mockResolvedValue(mockStats);

      const result = await controller.getDriverStatistics({});
      expect(result).toBeDefined();
      expect(service.getDriverStatistics).toHaveBeenCalled();
    });
  });

  describe('getRevenueStatistics', () => {
    it('should return revenue statistics', async () => {
      const mockStats = {
        totalRevenue: 5000,
        cashRevenue: 2000,
        revenueDistribution: { cash: 40, account: 50, deputy: 10 },
      };

      mockStatisticsService.getRevenueStatistics.mockResolvedValue(mockStats);

      const result = await controller.getRevenueStatistics({});
      expect(result).toBeDefined();
      expect(service.getRevenueStatistics).toHaveBeenCalled();
    });
  });

  describe('getCallStatistics', () => {
    it('should return call statistics', async () => {
      const mockStats = {
        totalCalls: 20,
        connectedCalls: 18,
        averageCallDuration: 100,
      };

      mockStatisticsService.getCallStatistics.mockResolvedValue(mockStats);

      const result = await controller.getCallStatistics({});
      expect(result).toBeDefined();
      expect(service.getCallStatistics).toHaveBeenCalled();
    });
  });

  describe('getHourlyStatistics', () => {
    it('should return hourly statistics', async () => {
      const mockStats = {
        hourly: [],
        peakHour: 10,
      };

      mockStatisticsService.getHourlyStatistics.mockResolvedValue(mockStats);

      const result = await controller.getHourlyStatistics({});
      expect(result).toBeDefined();
      expect(service.getHourlyStatistics).toHaveBeenCalled();
    });
  });
});
