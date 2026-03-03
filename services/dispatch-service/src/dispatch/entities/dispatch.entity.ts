import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum DispatchStatus {
  PENDING = 0, // 待派单
  DISPATCHED = 1, // 已派单
  ACCEPTED = 2, // 已接单
  REJECTED = 3, // 已拒绝
  TIMEOUT = 4, // 已超时
  CANCELLED = 5, // 已取消
}

@Schema({ timestamps: true })
export class Dispatch extends Document {
  @Prop({ required: true, unique: true })
  dispatchId: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  driverId: string;

  @Prop({ required: true, default: DispatchStatus.PENDING })
  status: DispatchStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop()
  assignedAt?: Date;

  @Prop()
  acceptedAt?: Date;

  @Prop()
  rejectedAt?: Date;

  @Prop({ default: 30 })
  timeoutSeconds: number;

  @Prop({ type: Types.ObjectId, ref: 'Driver' })
  driverInfo?: Types.ObjectId;
}

export const DispatchSchema = SchemaFactory.createForClass(Dispatch);
