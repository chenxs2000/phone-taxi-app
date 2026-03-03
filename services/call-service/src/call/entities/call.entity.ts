import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum CallType {
  INCOMING = 1, // 呼入
  OUTGOING = 2, // 呼出
}

export enum CallStatus {
  PENDING = 0, // 待呼叫
  DIALING = 1, // 呼叫中
  CONNECTED = 2, // 已接通
  ENDED = 3, // 已结束
  FAILED = 4, // 失败
  BUSY = 5, // 忙碌
  NO_ANSWER = 6, // 无人接听
}

@Schema({ timestamps: true })
export class Call extends Document {
  @Prop({ required: true, unique: true })
  callId: string;

  @Prop({ required: true, enum: CallType })
  type: CallType;

  @Prop({ required: true })
  callerNumber: string;

  @Prop({ required: true })
  calleeNumber: string;

  @Prop({ required: true, default: CallStatus.PENDING })
  status: CallStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  driverId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  agentId?: Types.ObjectId;

  @Prop()
  orderId?: string;

  @Prop()
  startTime?: Date;

  @Prop()
  endTime?: Date;

  @Prop({ default: 0 })
  duration: number; // 通话时长（秒）

  @Prop()
  recordingUrl?: string;

  @Prop()
  transcription?: string; // 通话转录文本

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const CallSchema = SchemaFactory.createForClass(Call);
