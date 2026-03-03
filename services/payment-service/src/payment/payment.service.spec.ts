import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentStatus, PaymentType } from './entities/payment.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentModel: Model<Payment>;

  const mockQuery = {
    exec: jest.fn().mockResolvedValue([]),
  };

  const createMockPayment = (overrides = {}) => ({
    paymentId: 'payment-123',
    orderId: 'order-123',
    paymentType: PaymentType.ACCOUNT,
    amount: 100,
    status: PaymentStatus.PENDING,
    remarks: '测试支付',
    ...overrides,
    save: jest.fn().mockImplementation(function() {
      return Promise.resolve(this);
    }),
  });

  // 创建一个模拟的 Model 构造函数
  const MockModel = jest.fn().mockImplementation((dto) => {
    return {
      ...createMockPayment(),
      ...dto,
    };
  }) as any;

  // 添加 Model 的方法到 MockModel
  MockModel.find = jest.fn().mockReturnValue(mockQuery);
  MockModel.findOne = jest.fn().mockResolvedValue(null);
  MockModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
  MockModel.countDocuments = jest.fn().mockResolvedValue(1);

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getModelToken(Payment.name),
          useValue: MockModel,
        },
      ],
    }).compile();
    service = module.get<PaymentService>(PaymentService);
    paymentModel = module.get<Model<Payment>>(getModelToken(Payment.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a new payment', async () => {
      MockModel.findOne.mockResolvedValue(null);

      const dto = {
        orderId: 'order-123',
        paymentType: PaymentType.ACCOUNT,
        amount: 100,
        remarks: '测试支付',
      };

      const result = await service.createPayment(dto);
      expect(result).toBeDefined();
      expect(result.orderId).toBe(dto.orderId);
      expect(result.amount).toBe(dto.amount);
    });

    it('should throw BadRequestException if payment already exists', async () => {
      const mockExistingPayment = createMockPayment();
      MockModel.findOne.mockResolvedValue(mockExistingPayment);

      const dto = {
        orderId: 'order-123',
        paymentType: PaymentType.ACCOUNT,
        amount: 100,
      };

      await expect(service.createPayment(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPayment', () => {
    it('should return a payment by paymentId', async () => {
      const mockPayment = createMockPayment();
      MockModel.findOne.mockResolvedValue(mockPayment);

      const result = await service.getPayment('payment-123');
      expect(result).toBeDefined();
      expect(result.paymentId).toBe('payment-123');
    });

    it('should throw NotFoundException if payment not found', async () => {
      MockModel.findOne.mockResolvedValue(null);
      await expect(service.getPayment('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('processPayment', () => {
    it('should process a payment', async () => {
      const mockPayment = createMockPayment({ status: PaymentStatus.PENDING });
      MockModel.findOne.mockResolvedValue(mockPayment);

      const dto = {
        paymentId: 'payment-123',
        transactionId: 'txn-123',
      };

      const result = await service.processPayment('payment-123', dto);
      expect(result.status).toBe(PaymentStatus.PAID);
      expect(result.paymentTime).toBeDefined();
    });
  });

  describe('refundPayment', () => {
    it('should refund a payment', async () => {
      const mockPaidPayment = createMockPayment({ status: PaymentStatus.PAID });
      MockModel.findOne.mockResolvedValue(mockPaidPayment);

      const result = await service.refundPayment('payment-123', { paymentId: 'payment-123', reason: '用户退款' });
      expect(result.status).toBe(PaymentStatus.REFUNDED);
    });

    it('should throw BadRequestException if payment not paid', async () => {
      const mockPendingPayment = createMockPayment({ status: PaymentStatus.PENDING });
      MockModel.findOne.mockResolvedValue(mockPendingPayment);

      await expect(service.refundPayment('payment-123', { paymentId: 'payment-123' })).rejects.toThrow(BadRequestException);
    });
  });
});
