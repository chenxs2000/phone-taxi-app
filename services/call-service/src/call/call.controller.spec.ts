import { Test, TestingModule } from '@nestjs/testing';
import { CallController } from './call.controller';
import { CallService } from './call.service';
import { CallType, CallStatus } from './entities/call.entity';

describe('CallController', () => {
  let controller: CallController;
  let service: CallService;

  const mockCallService = {
    initiateCall: jest.fn(),
    endCall: jest.fn(),
    createCall: jest.fn(),
    getCall: jest.fn(),
    getCalls: jest.fn(),
    getCallsByOrderId: jest.fn(),
    getUserCalls: jest.fn(),
    updateCall: jest.fn(),
    deleteCall: jest.fn(),
    getCallRecording: jest.fn(),
    getCallTranscription: jest.fn(),
    getDailyStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CallController],
      providers: [
        {
          provide: CallService,
          useValue: mockCallService,
        },
      ],
    }).compile();

    controller = module.get<CallController>(CallController);
    service = module.get<CallService>(CallService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();
      expect(result).toEqual({ status: 'ok', service: 'call-service' });
    });
  });

  describe('initiateCall', () => {
    it('should initiate a call', async () => {
      const dto = {
        type: CallType.OUTGOING,
        callerNumber: '010-12345678',
        calleeNumber: '13800138000',
        orderId: 'order-123',
      };

      const mockCall = {
        callId: 'call-123',
        ...dto,
        status: CallStatus.DIALING,
        startTime: new Date(),
      };

      mockCallService.initiateCall.mockResolvedValue(mockCall);

      const result = await controller.initiateCall(dto);
      expect(result).toBeDefined();
      expect(service.initiateCall).toHaveBeenCalledWith(dto);
    });
  });

  describe('endCall', () => {
    it('should end a call', async () => {
      const mockCall = {
        callId: 'call-123',
        status: CallStatus.ENDED,
        endTime: new Date(),
        duration: 120,
      };

      mockCallService.endCall.mockResolvedValue(mockCall);

      const result = await controller.endCall('call-123');
      expect(result).toBeDefined();
      expect(result.status).toBe(CallStatus.ENDED);
    });
  });

  describe('createCall', () => {
    it('should create a call', async () => {
      const dto = {
        type: CallType.OUTGOING,
        callerNumber: '010-12345678',
        calleeNumber: '13800138000',
      };

      const mockCall = {
        callId: 'call-123',
        ...dto,
        status: CallStatus.PENDING,
      };

      mockCallService.createCall.mockResolvedValue(mockCall);

      const result = await controller.createCall(dto);
      expect(result).toBeDefined();
      expect(service.createCall).toHaveBeenCalledWith(dto);
    });
  });

  describe('getCall', () => {
    it('should return a call by callId', async () => {
      const mockCall = {
        callId: 'call-123',
        callerNumber: '010-12345678',
        calleeNumber: '13800138000',
      };

      mockCallService.getCall.mockResolvedValue(mockCall);

      const result = await controller.getCall('call-123');
      expect(result).toBeDefined();
      expect(service.getCall).toHaveBeenCalledWith('call-123');
    });
  });

  describe('getCalls', () => {
    it('should return calls list', async () => {
      mockCallService.getCalls.mockResolvedValue({
        list: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      });

      const result = await controller.getCalls();
      expect(result).toBeDefined();
      expect(service.getCalls).toHaveBeenCalled();
    });
  });

  describe('getDailyStatistics', () => {
    it('should return daily statistics', async () => {
      const mockStats = {
        date: '2024-01-01',
        totalCalls: 10,
        totalDuration: 1200,
      };

      mockCallService.getDailyStatistics.mockResolvedValue(mockStats);

      const result = await controller.getDailyStatistics();
      expect(result).toBeDefined();
      expect(service.getDailyStatistics).toHaveBeenCalled();
    });
  });
});
