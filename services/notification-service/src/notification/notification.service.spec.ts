import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationStatus,
  NotificationType,
  NotificationChannel,
} from './entities/notification.entity';
import { NotFoundException } from '@nestjs/common';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationModel: Model<Notification>;

  const mockQuery = {
    limit: jest.fn().mockReturnValue({
      skip: jest.fn().mockResolvedValue([]),
    }),
    exec: jest.fn().mockResolvedValue([]),
  };

  const createMockNotification = (overrides = {}) => ({
    notificationId: 'notif-123',
    type: NotificationType.ORDER_CREATED,
    channel: NotificationChannel.PUSH,
    title: '订单通知',
    content: '您有新的订单',
    status: NotificationStatus.PENDING,
    ...overrides,
    save: jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    }),
  });

  // 创建一个模拟的 Model 构造函数
  const MockModel = jest.fn().mockImplementation(dto => {
    return {
      ...createMockNotification(),
      ...dto,
    };
  }) as any;

  // 添加 Model 的方法到 MockModel
  MockModel.find = jest.fn().mockReturnValue(mockQuery);
  MockModel.findOne = jest.fn().mockResolvedValue(null);
  MockModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 });
  MockModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
  MockModel.countDocuments = jest.fn().mockResolvedValue(0);

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getModelToken(Notification.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationModel = module.get<Model<Notification>>(getModelToken(Notification.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a new notification', async () => {
      const dto = {
        type: NotificationType.ORDER_CREATED,
        channel: NotificationChannel.PUSH,
        title: '订单通知',
        content: '您有新的订单',
      };

      const result = await service.createNotification(dto);
      expect(result).toBeDefined();
      expect(result.title).toBe(dto.title);
    });
  });

  describe('getNotification', () => {
    it('should return a notification by notificationId', async () => {
      const mockNotification = createMockNotification();
      MockModel.findOne.mockResolvedValue(mockNotification);

      const result = await service.getNotification('notif-123');
      expect(result).toBeDefined();
      expect(result.notificationId).toBe('notif-123');
    });

    it('should throw NotFoundException if notification not found', async () => {
      MockModel.findOne.mockResolvedValue(null);
      await expect(service.getNotification('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendNotification', () => {
    it('should send a notification', async () => {
      const dto = {
        type: NotificationType.ORDER_CREATED,
        channel: NotificationChannel.PUSH,
        title: '订单通知',
        content: '您有新的订单',
        recipientIds: ['user-123'],
      };

      const result = await service.sendNotification(dto);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotification = createMockNotification();
      MockModel.findOne.mockResolvedValue(mockNotification);

      const result = await service.markAsRead('notif-123');
      expect(result.status).toBe(NotificationStatus.READ);
      expect(result.readAt).toBeDefined();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      MockModel.updateMany.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.markAllAsRead('user-123');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      MockModel.countDocuments.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-123');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('count');
      expect(result.count).toBe(5);
    });
  });
});
