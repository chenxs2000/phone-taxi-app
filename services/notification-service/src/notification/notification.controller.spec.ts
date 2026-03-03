import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationType, NotificationChannel } from './entities/notification.entity';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  const mockNotificationService = {
    sendNotification: jest.fn(),
    sendBatchNotifications: jest.fn(),
    createNotification: jest.fn(),
    getNotification: jest.fn(),
    getNotifications: jest.fn(),
    getUserNotifications: jest.fn(),
    getDriverNotifications: jest.fn(),
    updateNotification: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    resendNotification: jest.fn(),
    deleteNotification: jest.fn(),
    getUnreadCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();
      expect(result).toEqual({ status: 'ok', service: 'notification-service' });
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

      mockNotificationService.sendNotification.mockResolvedValue({
        success: true,
        count: 1,
        notifications: ['notif-123'],
      });

      const result = await controller.sendNotification(dto);
      expect(result).toBeDefined();
      expect(service.sendNotification).toHaveBeenCalledWith(dto);
    });
  });

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const dto = {
        type: NotificationType.ORDER_CREATED,
        channel: NotificationChannel.PUSH,
        title: '订单通知',
        content: '您有新的订单',
      };

      const mockNotif = {
        notificationId: 'notif-123',
        ...dto,
      };

      mockNotificationService.createNotification.mockResolvedValue(mockNotif);

      const result = await controller.createNotification(dto);
      expect(result).toBeDefined();
      expect(service.createNotification).toHaveBeenCalledWith(dto);
    });
  });

  describe('getNotification', () => {
    it('should return a notification by notificationId', async () => {
      const mockNotif = {
        notificationId: 'notif-123',
        title: '订单通知',
      };

      mockNotificationService.getNotification.mockResolvedValue(mockNotif);

      const result = await controller.getNotification('notif-123');
      expect(result).toBeDefined();
      expect(service.getNotification).toHaveBeenCalledWith('notif-123');
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications', async () => {
      mockNotificationService.getUserNotifications.mockResolvedValue({
        list: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      });

      const result = await controller.getUserNotifications('user-123');
      expect(result).toBeDefined();
      expect(service.getUserNotifications).toHaveBeenCalledWith('user-123', 1, 20, undefined);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotif = {
        notificationId: 'notif-123',
        status: 2,
      };

      mockNotificationService.markAsRead.mockResolvedValue(mockNotif);

      const result = await controller.markAsRead('notif-123');
      expect(result).toBeDefined();
      expect(result.status).toBe(2);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockNotificationService.getUnreadCount.mockResolvedValue({ count: 5 });

      const result = await controller.getUnreadCount('user-123');
      expect(result).toBeDefined();
      expect(result.count).toBe(5);
    });
  });
});
