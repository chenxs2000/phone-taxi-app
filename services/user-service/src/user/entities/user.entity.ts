import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId as MObjectId } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { nanoid } from 'nanoid';

export type UserDocument = User & Document;

export enum UserStatus {
  DISABLED = 0,
  NORMAL = 1,
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @ApiProperty({ description: '用户ID' })
  _id: MObjectId;

  @Prop({ unique: true, required: true })
  @ApiProperty({ description: '手机号' })
  phone: string;

  @Prop()
  @ApiProperty({ description: '用户名' })
  username?: string;

  @Prop()
  @ApiProperty({ description: '头像URL' })
  avatar?: string;

  @Prop()
  @ApiProperty({ description: '性别: 0-未知 1-男 2-女' })
  gender?: number;

  @Prop()
  @ApiProperty({ description: '生日' })
  birthday?: Date;

  @Prop()
  @ApiProperty({ description: '身份证号' })
  idCard?: string;

  @Prop({ default: false })
  @ApiProperty({ description: '是否老年人' })
  isElderly: boolean;

  @Prop({ default: false })
  @ApiProperty({ description: '是否会员' })
  isVip: boolean;

  @Prop()
  @ApiProperty({ description: '会员等级' })
  vipLevel?: number;

  @Prop()
  @ApiProperty({ description: '会员到期时间' })
  vipExpireTime?: Date;

  @Prop({ default: UserStatus.NORMAL })
  @ApiProperty({ description: '状态: 0-禁用 1-正常' })
  status: UserStatus;

  @Prop({ default: 0 })
  @ApiProperty({ description: '总订单数' })
  totalOrders: number;

  @Prop({ default: 0 })
  @ApiProperty({ description: '总消费金额' })
  totalAmount: number;

  @Prop()
  @ApiProperty({ description: '最后叫车时间' })
  lastOrderTime?: Date;

  @Prop()
  @ApiProperty({ description: '注册渠道' })
  registerChannel?: string;

  @Prop()
  @ApiProperty({ description: '注册来源' })
  registerSource?: string;

  @Prop({ type: [String], default: [] })
  @ApiProperty({ description: '用户标签' })
  tags: string[];

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
