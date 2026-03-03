import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CallService } from './call.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { InitiateCallDto } from './dto/initiate-call.dto';

@Controller('call')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'call-service' };
  }

  // ==================== 呼叫相关接口 ====================

  @Post('initiate')
  async initiateCall(@Body() dto: InitiateCallDto) {
    return this.callService.initiateCall(dto);
  }

  @Post(':callId/end')
  @HttpCode(HttpStatus.OK)
  async endCall(@Param('callId') callId: string) {
    return this.callService.endCall(callId);
  }

  // ==================== 呼叫记录管理接口 ====================

  @Post()
  async createCall(@Body() dto: CreateCallDto) {
    return this.callService.createCall(dto);
  }

  @Get(':callId')
  async getCall(@Param('callId') callId: string) {
    return this.callService.getCall(callId);
  }

  @Get()
  async getCalls(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('userId') userId?: string,
    @Query('driverId') driverId?: string,
    @Query('agentId') agentId?: string,
    @Query('orderId') orderId?: string,
    @Query('status') status?: number,
    @Query('type') type?: number,
  ) {
    return this.callService.getCalls(page, pageSize, {
      userId,
      driverId,
      agentId,
      orderId,
      status,
      type,
    });
  }

  @Get('order/:orderId')
  async getCallsByOrderId(@Param('orderId') orderId: string) {
    return this.callService.getCallsByOrderId(orderId);
  }

  @Get('user/:userId')
  async getUserCalls(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    return this.callService.getUserCalls(userId, page, pageSize);
  }

  @Put(':callId')
  async updateCall(@Param('callId') callId: string, @Body() dto: UpdateCallDto) {
    return this.callService.updateCall(callId, dto);
  }

  @Delete(':callId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCall(@Param('callId') callId: string) {
    return this.callService.deleteCall(callId);
  }

  // ==================== 通话记录接口 ====================

  @Get(':callId/recording')
  async getCallRecording(@Param('callId') callId: string) {
    return this.callService.getCallRecording(callId);
  }

  @Get(':callId/transcription')
  async getCallTranscription(@Param('callId') callId: string) {
    return this.callService.getCallTranscription(callId);
  }

  // ==================== 统计接口 ====================

  @Get('statistics/daily')
  async getDailyStatistics(@Query('date') date?: string) {
    return this.callService.getDailyStatistics(date);
  }
}
