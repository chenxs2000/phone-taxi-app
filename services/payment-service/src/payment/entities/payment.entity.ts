import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PaymentType {
  CASH = 1, // 现金
  DEPUTY = 2, // 代付
  ACCOUNT = 3, // 账户
}

export enum PaymentStatus {
  PENDING = 0, // 待支付
  PAID = 1, // 已支付
  REFUNDED = 2, // 已退款
  CANCELLED = 3, // 已取消
}

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true, unique: true })
  paymentId: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true, enum: PaymentType })
  paymentType: PaymentType;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deputyUserId?: Types.ObjectId; // 代付用户ID

  @Prop()
  paymentTime?: Date;

  @Prop()
  transactionId?: string;

  @Prop()
  remarks?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
