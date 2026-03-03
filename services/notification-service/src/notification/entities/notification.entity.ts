import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationType {
  ORDER_CREATED = 1, // 订单创建
  ORDER_DISPATCHED = 2, // 订单派单
  ORDER_ACCEPTED = 3, // 订单接单
  ORDER_CANCELLED = 4, // 订单取消
  DRIVER_ARRIVED = 5, // 司机到达
  TRIP_STARTED = 6, // 行程开始
  TRIP_COMPLETED = 7, // 行程完成
  PAYMENT_SUCCESS = 8, // 支付成功
  PAYMENT_FAILED = 9, // 支付失败
  REFUND_SUCCESS = 10, // 退款成功
  SYSTEM = 99, // 系统通知
}

export enum NotificationStatus {
  PENDING = 0, // 待发送
  SENT = 1, // 已发送
  READ = 2, // 已读
  FAILED = 3, // 发送失败
}

export enum NotificationChannel {
  PUSH = 1, // 推送通知
  SMS = 2, // 短信
  EMAIL = 3, // 邮件
  IN_APP = 4, // 应用内通知
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true, unique: true })
  notificationId: string;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, enum: NotificationChannel })
  channel: NotificationChannel;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  driverId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  agentId?: Types.ObjectId;

  @Prop()
  orderId?: string;

  @Prop()
  sentAt?: Date;

  @Prop()
  readAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop()
  errorMessage?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
