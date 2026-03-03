import { Test, TestingModule } from '@nestjs/testing';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { DispatchStatus } from './entities/dispatch.entity';

describe('DispatchController', () => {
  let controller: DispatchController;
  let service: DispatchService;

  const mockDispatchService = {
    dispatchOrder: jest.fn(),
    batchDispatch: jest.fn(),
    getDispatch: jest.fn(),
    getDispatchByOrderId: jest.fn(),
    updateDispatch: jest.fn(),
    acceptDispatch: jest.fn(),
    rejectDispatch: jest.fn(),
    deleteDispatch: jest.fn(),
    createDriver: jest.fn(),
    getDriver: jest.fn(),
    updateDriverStatus: jest.fn(),
    updateDriverLocation: jest.fn(),
    findNearbyDrivers: jest.fn(),
    getAvailableDrivers: jest.fn(),
    getDrivers: jest.fn(),
    deleteDriver: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DispatchController],
      providers: [
        {
          provide: DispatchService,
          useValue: mockDispatchService,
        },
      ],
    }).compile();

    controller = module.get<DispatchController>(DispatchController);
    service = module.get<DispatchService>(DispatchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();
      expect(result).toEqual({ status: 'ok', service: 'dispatch-service' });
    });
  });

  describe('dispatchOrder', () => {
    it('should dispatch an order', async () => {
      const dto = {
        orderId: 'order-123',
        carType: '1',
        location: '39.915,116.404',
      };

      mockDispatchService.dispatchOrder.mockResolvedValue({
        orderId: 'order-123',
        dispatchedCount: 3,
        dispatches: [],
      });

      const result = await controller.dispatchOrder(dto);
      expect(result).toBeDefined();
      expect(service.dispatchOrder).toHaveBeenCalledWith(dto);
    });
  });

  describe('getAvailableDrivers', () => {
    it('should return available drivers', async () => {
      mockDispatchService.getAvailableDrivers.mockResolvedValue({
        drivers: [],
        count: 0,
      });

      const result = await controller.getAvailableDrivers();
      expect(result).toBeDefined();
      expect(service.getAvailableDrivers).toHaveBeenCalled();
    });
  });

  describe('createDriver', () => {
    it('should create a driver', async () => {
      const dto = {
        name: '新司机',
        phone: '13900139000',
        carPlate: '京B54321',
      };

      mockDispatchService.createDriver.mockResolvedValue(dto);

      const result = await controller.createDriver(dto);
      expect(result).toBeDefined();
      expect(service.createDriver).toHaveBeenCalledWith(dto);
    });
  });

  describe('acceptDispatch', () => {
    it('should accept a dispatch', async () => {
      const mockDispatch = {
        dispatchId: 'dispatch-123',
        orderId: 'order-123',
        status: DispatchStatus.ACCEPTED,
      };

      mockDispatchService.acceptDispatch.mockResolvedValue(mockDispatch);

      const result = await controller.acceptDispatch('dispatch-123');
      expect(result).toBeDefined();
      expect(result.status).toBe(DispatchStatus.ACCEPTED);
      expect(service.acceptDispatch).toHaveBeenCalledWith('dispatch-123');
    });
  });
});
