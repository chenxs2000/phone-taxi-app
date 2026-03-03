import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DailyStatistics extends Document {
  @Prop({ required: true, unique: true })
  date: string; // YYYY-MM-DD

  // 订单统计
  @Prop({ default: 0 })
  totalOrders: number;

  @Prop({ default: 0 })
  completedOrders: number;

  @Prop({ default: 0 })
  cancelledOrders: number;

  @Prop({ default: 0 })
  timeoutOrders: number;

  // 用户统计
  @Prop({ default: 0 })
  newUsers: number;

  @Prop({ default: 0 })
  activeUsers: number;

  // 司机统计
  @Prop({ default: 0 })
  activeDrivers: number;

  @Prop({ default: 0 })
  totalTrips: number;

  // 收入统计
  @Prop({ default: 0 })
  totalRevenue: number;

  @Prop({ default: 0 })
  cashRevenue: number;

  @Prop({ default: 0 })
  accountRevenue: number;

  @Prop({ default: 0 })
  deputyRevenue: number;

  // 支付统计
  @Prop({ default: 0 })
  totalPayments: number;

  @Prop({ default: 0 })
  successfulPayments: number;

  @Prop({ default: 0 })
  refundedPayments: number;

  @Prop({ default: 0 })
  refundedAmount: number;

  // 通话统计
  @Prop({ default: 0 })
  totalCalls: number;

  @Prop({ default: 0 })
  connectedCalls: number;

  @Prop({ default: 0 })
  totalCallDuration: number;

  // 通知统计
  @Prop({ default: 0 })
  totalNotifications: number;

  @Prop({ default: 0 })
  sentNotifications: number;

  @Prop({ default: 0 })
  failedNotifications: number;

  // 订单类型分布
  @Prop({ type: Object })
  orderTypeDistribution: {
    instant: number;
    booking: number;
    urgent: number;
  };

  // 车型分布
  @Prop({ type: Object })
  carTypeDistribution: {
    normal: number;
    comfort: number;
    accessible: number;
  };

  // 时段分布
  @Prop({ type: Object })
  hourlyDistribution: number[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const DailyStatisticsSchema = SchemaFactory.createForClass(DailyStatistics);
