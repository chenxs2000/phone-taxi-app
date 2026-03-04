import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId as MObjectId } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { OrderType, CarType, OrderStatus } from './order.entity';

// 工具函数
function generateOrderNo(): string {
  const prefix = 'TAXI';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

export type OrderDocument = Order & Document;

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @ApiProperty({ description: '订单ID' })
  _id: MObjectId;

  @ApiProperty({ description: '订单号' })
  orderNo: string;

  @ApiProperty({ description: '乘客ID' })
  userId: MObjectId;

  @ApiProperty({ description: '司机ID' })
  driverId?: MObjectId;

  @ApiProperty({ description: '关联通话ID' })
  callId?: MObjectId;

  @ApiProperty({ description: '坐席ID' })
  agentId?: MObjectId;

  @ApiProperty({ description: '订单类型: 1-即时 2-预约 3-紧急' })
  orderType: OrderType;

  @ApiProperty({ description: '车型: 1-普通 2-舒适 3-无障碍' })
  carType?: CarType;

  @ApiProperty({ description: '乘客人数' })
  passengerCount: number;

  @ApiProperty({ description: '上车信息' })
  pickup: {
    lat: number;
    lng: number;
    address: string;
    landmark?: string;
  };

  @ApiProperty({ description: '目的地信息' })
  destination: {
    lat: number;
    lng: number;
    address: string;
  };

  @ApiProperty({ description: '创建时间' })
  createTime: Date;

  @ApiProperty({ description: '预约用车时间' })
  bookingTime?: Date;

  @ApiProperty({ description: '派单时间' })
  dispatchTime?: Date;

  @ApiProperty({ description: '接单时间' })
  acceptTime?: Date;

  @ApiProperty({ description: '到达时间' })
  arriveTime?: Date;

  @ApiProperty({ description: '开始行程时间' })
  startTime?: Date;

  @ApiProperty({ description: '结束时间' })
  endTime?: Date;

  @ApiProperty({ description: '订单状态' })
  orderStatus: OrderStatus;

  @ApiProperty({ description: '预估费用' })
  fare: {
    estimated: number;
    actual?: number;
    base?: number;
    distance?: number;
    time?: number;
    surge?: number;
    service?: number;
  };

  @ApiProperty({ description: '行程信息' })
  distance?: number;
  duration?: number;
  route?: {
    polyline: string;
    steps?: Array<{
      instruction: string;
      distance: number;
      duration: number;
    }>;
  };

  @ApiProperty({ description: '支付信息' })
  payment: {
    method?: number;
    status: number;
    time?: Date;
    payerId?: MObjectId;
  };

  @ApiProperty({ description: '取消信息' })
  cancel?: {
    reason?: string;
    by?: number;
  };

  @ApiProperty({ description: '评价' })
  rating?: number;
  comment?: string;

  @ApiProperty({ description: '是否黑名单订单' })
  isBlacklist: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiProperty({ description: '状态变更记录（嵌套数组）' })
  statusLogs: Array<{
    oldStatus: number;
    newStatus: number;
    operatorId?: MObjectId;
    operatorType?: number;
    remark?: string;
    createdAt: Date;
  }>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Hook: 生成订单号
OrderSchema.pre('save', function (next) {
  if (!this.orderNo) {
    this.orderNo = generateOrderNo();
  }
  next();
});
