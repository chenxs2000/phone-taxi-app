import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationStatus,
  NotificationType,
  NotificationChannel,
} from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationService {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<Notification>) {}

  async sendNotification(dto: SendNotificationDto) {
    const notifications = [];

    for (const recipientId of dto.recipientIds) {
      const notification = new this.notificationModel({
        notificationId: uuidv4(),
        type: dto.type,
        channel: dto.channel,
        title: dto.title,
        content: dto.content,
        status: NotificationStatus.PENDING,
        orderId: dto.orderId,
      });

      // 根据 recipientId 的类型设置相应的字段
      // TODO: 根据用户类型判断是用户、司机还是坐席
      notification.userId = recipientId as any;

      notifications.push(notification);
      await notification.save();

      // TODO: 实际发送通知
      // await this.sendToChannel(notification);
    }

    return {
      success: true,
      count: notifications.length,
      notifications: notifications.map(n => n.notificationId),
    };
  }

  async sendBatchNotifications(dtos: SendNotificationDto[]) {
    const results = [];

    for (const dto of dtos) {
      const result = await this.sendNotification(dto);
      results.push(result);
    }

    return {
      success: true,
      total: results.length,
      results,
    };
  }

  async createNotification(dto: CreateNotificationDto) {
    const notification = new this.notificationModel({
      notificationId: uuidv4(),
      type: dto.type,
      channel: dto.channel,
      title: dto.title,
      content: dto.content,
      status: NotificationStatus.PENDING,
      userId: dto.userId as any,
      driverId: dto.driverId as any,
      agentId: dto.agentId as any,
      orderId: dto.orderId,
    });

    return notification.save();
  }

  async getNotification(notificationId: string) {
    const notification = await this.notificationModel.findOne({ notificationId });
    if (!notification) {
      throw new NotFoundException('通知不存在');
    }
    return notification;
  }

  async getNotifications(page: number, pageSize: number, filters: any) {
    const filter: any = {};
    if (filters.userId) filter.userId = filters.userId;
    if (filters.driverId) filter.driverId = filters.driverId;
    if (filters.agentId) filter.agentId = filters.agentId;
    if (filters.status !== undefined) filter.status = filters.status;
    if (filters.type !== undefined) filter.type = filters.type;

    const skip = (page - 1) * pageSize;
    const [notifications, total] = await Promise.all([
      this.notificationModel.find(filter).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
      this.notificationModel.countDocuments(filter),
    ]);

    return {
      list: notifications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getUserNotifications(userId: string, page: number, pageSize: number, unread?: boolean) {
    const filter: any = { userId };
    if (unread) {
      filter.status = { $in: [NotificationStatus.SENT, NotificationStatus.PENDING] };
    }

    const skip = (page - 1) * pageSize;
    const [notifications, total] = await Promise.all([
      this.notificationModel.find(filter).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
      this.notificationModel.countDocuments(filter),
    ]);

    return {
      list: notifications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getDriverNotifications(driverId: string, page: number, pageSize: number, unread?: boolean) {
    const filter: any = { driverId };
    if (unread) {
      filter.status = { $in: [NotificationStatus.SENT, NotificationStatus.PENDING] };
    }

    const skip = (page - 1) * pageSize;
    const [notifications, total] = await Promise.all([
      this.notificationModel.find(filter).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
      this.notificationModel.countDocuments(filter),
    ]);

    return {
      list: notifications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateNotification(notificationId: string, dto: UpdateNotificationDto) {
    const notification = await this.getNotification(notificationId);
    Object.assign(notification, dto);
    await notification.save();
    return notification;
  }

  async markAsRead(notificationId: string) {
    const notification = await this.getNotification(notificationId);
    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();
    await notification.save();
    return notification;
  }

  async markAllAsRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      { userId, status: { $in: [NotificationStatus.SENT, NotificationStatus.PENDING] } },
      { status: NotificationStatus.READ, readAt: new Date() }
    );
    return {
      success: true,
      count: result.modifiedCount,
    };
  }

  async resendNotification(notificationId: string) {
    const notification = await this.getNotification(notificationId);

    if (notification.status === NotificationStatus.SENT) {
      throw new BadRequestException('通知已发送，无需重发');
    }

    notification.status = NotificationStatus.PENDING;
    notification.retryCount = (notification.retryCount || 0) + 1;
    await notification.save();

    // TODO: 实际发送通知
    // await this.sendToChannel(notification);

    return notification;
  }

  async deleteNotification(notificationId: string) {
    await this.notificationModel.deleteOne({ notificationId });
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationModel.countDocuments({
      userId,
      status: { $in: [NotificationStatus.SENT, NotificationStatus.PENDING] },
    });
    return { count };
  }

  // ==================== 私有方法 ====================

  private async sendToChannel(notification: Notification) {
    try {
      let sent = false;

      switch (notification.channel) {
        case NotificationChannel.PUSH:
          // TODO: 推送通知
          sent = await this.sendPushNotification(notification);
          break;
        case NotificationChannel.SMS:
          // TODO: 短信通知
          sent = await this.sendSMSNotification(notification);
          break;
        case NotificationChannel.EMAIL:
          // TODO: 邮件通知
          sent = await this.sendEmailNotification(notification);
          break;
        case NotificationChannel.IN_APP:
          // TODO: 应用内通知
          sent = await this.sendInAppNotification(notification);
          break;
      }

      if (sent) {
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
      } else {
        notification.status = NotificationStatus.FAILED;
        notification.errorMessage = '发送失败';
      }

      await notification.save();
    } catch (error) {
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = error.message;
      await notification.save();
    }
  }

  private async sendPushNotification(notification: Notification): Promise<boolean> {
    // TODO: 集成推送服务 (如 Firebase Cloud Messaging, JPush 等)
    console.log('发送推送通知:', notification.title, notification.content);
    return true;
  }

  private async sendSMSNotification(notification: Notification): Promise<boolean> {
    // TODO: 集成短信服务 (如阿里云短信, 腾讯云短信等)
    console.log('发送短信通知:', notification.content);
    return true;
  }

  private async sendEmailNotification(notification: Notification): Promise<boolean> {
    // TODO: 集成邮件服务 (如 SendGrid, 阿里云邮件等)
    console.log('发送邮件通知:', notification.title, notification.content);
    return true;
  }

  private async sendInAppNotification(notification: Notification): Promise<boolean> {
    // TODO: 通过 WebSocket 发送应用内通知
    console.log('发送应用内通知:', notification.title, notification.content);
    return true;
  }
}
