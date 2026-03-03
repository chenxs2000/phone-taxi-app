import { Test, TestingModule } from '@nestjs/testing';
import { CallService } from './call.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Call, CallStatus, CallType } from './entities/call.entity';
import { NotFoundException } from '@nestjs/common';

describe('CallService', () => {
  let service: CallService;
  let callModel: Model<Call>;

  const createMockCall = (overrides = {}) => ({
    callId: 'call-123',
    type: CallType.OUTGOING,
    callerNumber: '010-12345678',
    calleeNumber: '13800138000',
    status: CallStatus.CONNECTED,
    startTime: new Date('2024-01-01T10:00:00'),
    duration: 120,
    ...overrides,
    save: jest.fn().mockImplementation(function() {
      return Promise.resolve(this);
    }),
  });

  const mockQuery = {
    exec: jest.fn().mockResolvedValue([]),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  };

  // 创建一个模拟的 Model 构造函数
  const MockModel = jest.fn().mockImplementation((dto) => {
    return {
      ...createMockCall(),
      ...dto,
    };
  }) as any;

  // 添加 Model 的方法到 MockModel
  MockModel.find = jest.fn().mockReturnValue(mockQuery);
  MockModel.findOne = jest.fn().mockResolvedValue(null);
  MockModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
  MockModel.countDocuments = jest.fn().mockResolvedValue(0);

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallService,
        {
          provide: getModelToken(Call.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<CallService>(CallService);
    callModel = module.get<Model<Call>>(getModelToken(Call.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCall', () => {
    it('should create a new call', async () => {
      const dto = {
        type: CallType.OUTGOING,
        callerNumber: '010-12345678',
        calleeNumber: '13800138000',
      };

      const result = await service.createCall(dto);
      expect(result).toBeDefined();
      expect(result.callerNumber).toBe(dto.callerNumber);
      expect(result.calleeNumber).toBe(dto.calleeNumber);
    });
  });

  describe('getCall', () => {
    it('should return a call by callId', async () => {
      const mockCall = createMockCall();
      MockModel.findOne.mockResolvedValue(mockCall);

      const result = await service.getCall('call-123');
      expect(result).toBeDefined();
      expect(result.callId).toBe('call-123');
    });

    it('should throw NotFoundException if call not found', async () => {
      MockModel.findOne.mockResolvedValue(null);
      await expect(service.getCall('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('initiateCall', () => {
    it('should initiate a call', async () => {
      const mockDialingCall = createMockCall({
        status: CallStatus.DIALING,
        startTime: new Date(),
      });
      MockModel.findOne.mockResolvedValue(mockDialingCall);

      const dto = {
        type: CallType.OUTGOING,
        callerNumber: '010-12345678',
        calleeNumber: '13800138000',
        orderId: 'order-123',
      };

      const result = await service.initiateCall(dto);
      expect(result).toBeDefined();
      expect(result.status).toBe(CallStatus.DIALING);
      expect(result.startTime).toBeDefined();
    });
  });

  describe('endCall', () => {
    it('should end a call', async () => {
      const mockConnectedCall = createMockCall({
        status: CallStatus.CONNECTED,
        startTime: new Date('2024-01-01T10:00:00'),
      });
      MockModel.findOne.mockResolvedValue(mockConnectedCall);

      const result = await service.endCall('call-123');
      expect(result.status).toBe(CallStatus.ENDED);
      expect(result.endTime).toBeDefined();
    });
  });

  describe('getCallsByOrderId', () => {
    it('should return calls by orderId', async () => {
      const mockCalls = [createMockCall()];
      mockQuery.exec.mockResolvedValue(mockCalls);

      const result = await service.getCallsByOrderId('order-123');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('calls');
      expect(result).toHaveProperty('count');
    });
  });

  describe('getDailyStatistics', () => {
    it('should return daily statistics', async () => {
      const mockCalls = [
        createMockCall({ status: CallStatus.CONNECTED, duration: 120 }),
        createMockCall({ callId: 'call-456', status: CallStatus.FAILED, duration: 30 }),
        createMockCall({ callId: 'call-789', status: CallStatus.CONNECTED, duration: 60 }),
      ];
      mockQuery.exec.mockResolvedValue(mockCalls);

      const result = await service.getDailyStatistics();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('date');
      expect(result).toHaveProperty('totalCalls');
      expect(result).toHaveProperty('totalDuration');
      expect(result.totalCalls).toBe(3);
      expect(result.connectedCount).toBe(2);
    });
  });
});
