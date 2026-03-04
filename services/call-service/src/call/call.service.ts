import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Call, CallStatus, CallType } from './entities/call.entity';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { InitiateCallDto } from './dto/initiate-call.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CallService {
  constructor(@InjectModel(Call.name) private callModel: Model<Call>) {}

  async initiateCall(dto: InitiateCallDto) {
    const call = new this.callModel({
      callId: uuidv4(),
      type: dto.type,
      callerNumber: dto.callerNumber,
      calleeNumber: dto.calleeNumber,
      status: CallStatus.DIALING,
      userId: dto.userId as any,
      driverId: dto.driverId as any,
      agentId: dto.agentId as any,
      orderId: dto.orderId,
      startTime: new Date(),
    });

    await call.save();

    // TODO: 实际发起呼叫 (集成云通信服务，如阿里云、腾讯云等)
    // await this.makePhoneCall(call);

    return call;
  }

  async endCall(callId: string) {
    const call = await this.getCall(callId);

    if (call.status !== CallStatus.CONNECTED && call.status !== CallStatus.DIALING) {
      throw new BadRequestException('通话状态不允许结束');
    }

    call.status = CallStatus.ENDED;
    call.endTime = new Date();

    if (call.startTime) {
      const durationMs = call.endTime.getTime() - call.startTime.getTime();
      call.duration = Math.floor(durationMs / 1000);
    }

    await call.save();

    // TODO: 获取通话录音和转录
    // await this.fetchCallRecording(call);
    // await this.fetchCallTranscription(call);

    return call;
  }

  async createCall(dto: CreateCallDto) {
    const call = new this.callModel({
      callId: uuidv4(),
      type: dto.type,
      callerNumber: dto.callerNumber,
      calleeNumber: dto.calleeNumber,
      status: CallStatus.PENDING,
      userId: dto.userId as any,
      driverId: dto.driverId as any,
      agentId: dto.agentId as any,
      orderId: dto.orderId,
    });

    return call.save();
  }

  async getCall(callId: string) {
    const call = await this.callModel.findOne({ callId });
    if (!call) {
      throw new NotFoundException('通话记录不存在');
    }
    return call;
  }

  async getCalls(page: number, pageSize: number, filters: any) {
    const filter: any = {};
    if (filters.userId) filter.userId = filters.userId;
    if (filters.driverId) filter.driverId = filters.driverId;
    if (filters.agentId) filter.agentId = filters.agentId;
    if (filters.orderId) filter.orderId = filters.orderId;
    if (filters.status !== undefined) filter.status = filters.status;
    if (filters.type !== undefined) filter.type = filters.type;

    const skip = (page - 1) * pageSize;
    const [calls, total] = await Promise.all([
      this.callModel.find(filter).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
      this.callModel.countDocuments(filter),
    ]);

    return {
      list: calls,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getCallsByOrderId(orderId: string) {
    const calls = await this.callModel.find({ orderId }).sort({ createdAt: -1 });
    return { calls, count: calls.length };
  }

  async getUserCalls(userId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [calls, total] = await Promise.all([
      this.callModel.find({ userId }).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
      this.callModel.countDocuments({ userId }),
    ]);

    return {
      list: calls,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateCall(callId: string, dto: UpdateCallDto) {
    const call = await this.getCall(callId);
    Object.assign(call, dto);
    await call.save();
    return call;
  }

  async deleteCall(callId: string) {
    await this.callModel.deleteOne({ callId });
  }

  async getCallRecording(callId: string) {
    const call = await this.getCall(callId);

    if (!call.recordingUrl) {
      throw new NotFoundException('录音不存在');
    }

    return {
      callId: call.callId,
      recordingUrl: call.recordingUrl,
    };
  }

  async getCallTranscription(callId: string) {
    const call = await this.getCall(callId);

    if (!call.transcription) {
      throw new NotFoundException('转录文本不存在');
    }

    return {
      callId: call.callId,
      transcription: call.transcription,
    };
  }

  async getDailyStatistics(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = this.callModel.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    const calls = await query.exec();

    const statistics = {
      date: startOfDay.toISOString().split('T')[0],
      totalCalls: calls.length,
      connectedCount: calls.filter(c => c.status === CallStatus.CONNECTED).length,
      failedCount: calls.filter(c => c.status === CallStatus.FAILED).length,
      busyCount: calls.filter(c => c.status === CallStatus.BUSY).length,
      noAnswerCount: calls.filter(c => c.status === CallStatus.NO_ANSWER).length,
      totalDuration: calls.reduce((sum, c) => sum + (c.duration || 0), 0),
      averageDuration:
        calls.length > 0 ? calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length : 0,
      callTypes: {
        incoming: calls.filter(c => c.type === CallType.INCOMING).length,
        outgoing: calls.filter(c => c.type === CallType.OUTGOING).length,
      },
    };

    return statistics;
  }

  // ==================== 私有方法 ====================

  private async makePhoneCall(call: Call) {
    try {
      // TODO: 集成云通信服务 API
      // 示例: 阿里云语音服务、腾讯云语音服务等
      console.log('发起呼叫:', {
        from: call.callerNumber,
        to: call.calleeNumber,
        type: call.type,
      });

      // 模拟呼叫结果
      // 实际应根据云通信服务的返回结果更新 call.status
    } catch (error) {
      call.status = CallStatus.FAILED;
      await call.save();
      throw error;
    }
  }

  private async fetchCallRecording(call: Call) {
    try {
      // TODO: 从云通信服务获取录音
      // 示例: 调用云通信 API 获取录音 URL
      console.log('获取通话录音:', call.callId);
    } catch (error) {
      console.error('获取录音失败:', error);
    }
  }

  private async fetchCallTranscription(call: Call) {
    try {
      // TODO: 调用语音识别服务获取转录文本
      // 示例: 阿里云语音识别、腾讯云语音识别等
      console.log('获取通话转录:', call.callId);
    } catch (error) {
      console.error('获取转录失败:', error);
    }
  }
}
