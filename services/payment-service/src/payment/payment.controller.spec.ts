import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentType, PaymentStatus } from './entities/payment.entity';

describe('PaymentController', () => {
  let controller: PaymentController;
  let service: PaymentService;

  const mockPaymentService = {
    createPayment: jest.fn(),
    getPayment: jest.fn(),
    getPaymentByOrderId: jest.fn(),
    getPayments: jest.fn(),
    updatePayment: jest.fn(),
    processPayment: jest.fn(),
    refundPayment: jest.fn(),
    deletePayment: jest.fn(),
    getDailyStatistics: jest.fn(),
    getPaymentSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();
      expect(result).toEqual({ status: 'ok', service: 'payment-service' });
    });
  });

  describe('createPayment', () => {
    it('should create a payment', async () => {
      const dto = {
        orderId: 'order-123',
        paymentType: PaymentType.ACCOUNT,
        amount: 100,
      };

      const mockPayment = {
        paymentId: 'payment-123',
        ...dto,
        status: PaymentStatus.PENDING,
      };

      mockPaymentService.createPayment.mockResolvedValue(mockPayment);

      const result = await controller.createPayment(dto);
      expect(result).toBeDefined();
      expect(service.createPayment).toHaveBeenCalledWith(dto);
    });
  });

  describe('getPayment', () => {
    it('should return a payment by paymentId', async () => {
      const mockPayment = {
        paymentId: 'payment-123',
        orderId: 'order-123',
        amount: 100,
        status: PaymentStatus.PAID,
      };

      mockPaymentService.getPayment.mockResolvedValue(mockPayment);

      const result = await controller.getPayment('payment-123');
      expect(result).toBeDefined();
      expect(service.getPayment).toHaveBeenCalledWith('payment-123');
    });
  });

  describe('getPayments', () => {
    it('should return payments list', async () => {
      mockPaymentService.getPayments.mockResolvedValue({
        list: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      });

      const result = await controller.getPayments();
      expect(result).toBeDefined();
      expect(service.getPayments).toHaveBeenCalled();
    });
  });

  describe('processPayment', () => {
    it('should process a payment', async () => {
      const dto = { paymentId: 'payment-123', transactionId: 'txn-123' };
      const mockPayment = {
        paymentId: 'payment-123',
        status: PaymentStatus.PAID,
        paymentTime: new Date(),
      };

      mockPaymentService.processPayment.mockResolvedValue(mockPayment);

      const result = await controller.processPayment('payment-123', dto);
      expect(result).toBeDefined();
      expect(result.status).toBe(PaymentStatus.PAID);
      expect(service.processPayment).toHaveBeenCalledWith('payment-123', dto);
    });
  });

  describe('refundPayment', () => {
    it('should refund a payment', async () => {
      const dto = { paymentId: 'payment-123', reason: '用户退款' };
      const mockPayment = {
        paymentId: 'payment-123',
        status: PaymentStatus.REFUNDED,
      };

      mockPaymentService.refundPayment.mockResolvedValue(mockPayment);

      const result = await controller.refundPayment('payment-123', dto);
      expect(result).toBeDefined();
      expect(result.status).toBe(PaymentStatus.REFUNDED);
      expect(service.refundPayment).toHaveBeenCalledWith('payment-123', dto);
    });
  });

  describe('getDailyStatistics', () => {
    it('should return daily statistics', async () => {
      const mockStats = {
        date: '2024-01-01',
        totalPayments: 10,
        totalAmount: 1000,
      };

      mockPaymentService.getDailyStatistics.mockResolvedValue(mockStats);

      const result = await controller.getDailyStatistics();
      expect(result).toBeDefined();
      expect(service.getDailyStatistics).toHaveBeenCalled();
    });
  });
});
