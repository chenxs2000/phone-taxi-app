import { Test, TestingModule } from '@nestjs/testing';
import { DispatchService } from './dispatch.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Driver, DriverStatus } from './entities/driver.entity';
import { Dispatch, DispatchStatus } from './entities/dispatch.entity';
import { NotFoundException } from '@nestjs/common';

describe('DispatchService', () => {
  let service: DispatchService;
  let driverModel: Model<Driver>;
  let dispatchModel: Model<Dispatch>;

  const mockDriver = {
    driverId: 'driver-123',
    name: '测试司机',
    phone: '13800138000',
    carType: 1,
    carPlate: '京A12345',
    status: DriverStatus.IDLE,
    isOnline: true,
    location: {
      type: 'Point',
      coordinates: [116.404, 39.915],
    },
    rating: 4.5,
    totalTrips: 100,
    save: jest.fn().mockResolvedValue(this),
  };

  const mockDispatch = {
    dispatchId: 'dispatch-123',
    orderId: 'order-123',
    driverId: 'driver-123',
    status: DispatchStatus.DISPATCHED,
    assignedAt: new Date(),
    timeoutSeconds: 30,
    save: jest.fn().mockResolvedValue(this),
  };

  const createMockDriver = () => ({
    driverId: 'driver-123',
    name: '测试司机',
    phone: '13800138000',
    carType: 1,
    carPlate: '京A12345',
    status: DriverStatus.IDLE,
    isOnline: true,
    location: {
      type: 'Point',
      coordinates: [116.404, 39.915],
    },
    rating: 4.5,
    totalTrips: 100,
    save: jest.fn().mockImplementation(function() {
      return Promise.resolve(this);
    }),
  });

  const createMockDispatch = () => ({
    dispatchId: 'dispatch-123',
    orderId: 'order-123',
    driverId: 'driver-123',
    status: DispatchStatus.DISPATCHED,
    assignedAt: new Date(),
    timeoutSeconds: 30,
    save: jest.fn().mockImplementation(function() {
      return Promise.resolve(this);
    }),
  });

  // 创建一个模拟的 Model 构造函数
  const MockDriverModel = jest.fn().mockImplementation((dto) => {
    return {
      ...createMockDriver(),
      ...dto,
    };
  }) as any;

  MockDriverModel.find = jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({
      skip: jest.fn().mockResolvedValue([createMockDriver()]),
    }),
  });
  MockDriverModel.findOne = jest.fn().mockResolvedValue(null);
  MockDriverModel.findOneAndUpdate = jest.fn().mockResolvedValue(createMockDriver());
  MockDriverModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
  MockDriverModel.countDocuments = jest.fn().mockResolvedValue(0);

  // 创建一个模拟的 Model 构造函数
  const MockDispatchModel = jest.fn().mockImplementation((dto) => {
    return {
      ...createMockDispatch(),
      ...dto,
    };
  }) as any;

  MockDispatchModel.find = jest.fn().mockResolvedValue([createMockDispatch()]);
  MockDispatchModel.findOne = jest.fn().mockResolvedValue(null);
  MockDispatchModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        {
          provide: getModelToken(Driver.name),
          useValue: MockDriverModel,
        },
        {
          provide: getModelToken(Dispatch.name),
          useValue: MockDispatchModel,
        },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
    driverModel = module.get<Model<Driver>>(getModelToken(Driver.name));
    dispatchModel = module.get<Model<Dispatch>>(getModelToken(Dispatch.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDriver', () => {
    it('should create a new driver', async () => {
      const driverData = {
        name: '新司机',
        phone: '13900139000',
        carType: 1,
        carPlate: '京B54321',
      };

      const result = await service.createDriver(driverData);
      expect(result).toBeDefined();
      expect(result.name).toBe(driverData.name);
    });
  });

  describe('getDriver', () => {
    it('should return a driver by driverId', async () => {
      MockDriverModel.findOne.mockResolvedValueOnce(createMockDriver());
      const result = await service.getDriver('driver-123');
      expect(result).toBeDefined();
      expect(result.driverId).toBe('driver-123');
    });

    it('should throw NotFoundException if driver not found', async () => {
      MockDriverModel.findOne.mockResolvedValueOnce(null);
      await expect(service.getDriver('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDriverStatus', () => {
    it('should update driver status', async () => {
      const mockDriver = createMockDriver();
      MockDriverModel.findOne.mockResolvedValueOnce(mockDriver);
      const dto = {
        driverId: 'driver-123',
        status: DriverStatus.ACCEPTING,
        isOnline: true,
      };

      const result = await service.updateDriverStatus('driver-123', dto);
      expect(result).toBeDefined();
      expect(result.status).toBe(DriverStatus.ACCEPTING);
    });
  });

  describe('getAvailableDrivers', () => {
    it('should return available drivers', async () => {
      const result = await service.getAvailableDrivers();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('drivers');
      expect(result).toHaveProperty('count');
    });
  });

  describe('getDispatch', () => {
    it('should return a dispatch by dispatchId', async () => {
      MockDispatchModel.findOne.mockResolvedValueOnce(createMockDispatch());
      const result = await service.getDispatch('dispatch-123');
      expect(result).toBeDefined();
      expect(result.dispatchId).toBe('dispatch-123');
    });
  });

  describe('acceptDispatch', () => {
    it('should accept a dispatch', async () => {
      const mockDispatch = createMockDispatch();
      MockDispatchModel.findOne.mockResolvedValueOnce(mockDispatch);
      const result = await service.acceptDispatch('dispatch-123');
      expect(result.status).toBe(DispatchStatus.ACCEPTED);
    });
  });
});
