import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export enum DriverStatus {
  IDLE = 1, // 空闲
  ACCEPTING = 2, // 接单中
  IN_TRIP = 3, // 载客
  OFFLINE = 4, // 下线
}

export enum CarType {
  NORMAL = 1, // 普通
  COMFORT = 2, // 舒适
  ACCESSIBLE = 3, // 无障碍
}

@Schema({ timestamps: true })
export class Driver extends Document {
  @Prop({ required: true, unique: true })
  driverId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, enum: CarType })
  carType: CarType;

  @Prop({ required: true })
  carPlate: string;

  @Prop({ required: true, default: DriverStatus.OFFLINE })
  status: DriverStatus;

  // 使用 any 类型避免 @nestjs/mongoose 的类型推断问题
  // 实际的 GeoJSON 类型通过原生 Schema API 定义
  location?: any;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalTrips: number;

  @Prop({ default: true })
  isOnline: boolean;

  @Prop({ default: 0 })
  currentOrderId?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;
}

// 使用原生 Mongoose Schema API 添加 location 字段以避免 @nestjs/mongoose 的类型推断问题
export const DriverSchema = SchemaFactory.createForClass(Driver);
DriverSchema.add({
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
  },
});
DriverSchema.index({ location: '2dsphere' });
