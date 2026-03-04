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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ProcessPaymentDto, RefundPaymentDto } from './dto/process-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'payment-service' };
  }

  // ==================== 支付相关接口 ====================

  @Post()
  async createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(dto);
  }

  @Get(':paymentId')
  async getPayment(@Param('paymentId') paymentId: string) {
    return this.paymentService.getPayment(paymentId);
  }

  @Get('order/:orderId')
  async getPaymentByOrderId(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentByOrderId(orderId);
  }

  @Get()
  async getPayments(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('status') status?: number,
    @Query('paymentType') paymentType?: number,
    @Query('userId') userId?: string
  ) {
    return this.paymentService.getPayments(page, pageSize, status, paymentType, userId);
  }

  @Put(':paymentId')
  async updatePayment(@Param('paymentId') paymentId: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentService.updatePayment(paymentId, dto);
  }

  @Post(':paymentId/process')
  @HttpCode(HttpStatus.OK)
  async processPayment(@Param('paymentId') paymentId: string, @Body() dto: ProcessPaymentDto) {
    return this.paymentService.processPayment(paymentId, dto);
  }

  @Post(':paymentId/refund')
  @HttpCode(HttpStatus.OK)
  async refundPayment(@Param('paymentId') paymentId: string, @Body() dto: RefundPaymentDto) {
    return this.paymentService.refundPayment(paymentId, dto);
  }

  @Delete(':paymentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePayment(@Param('paymentId') paymentId: string) {
    return this.paymentService.deletePayment(paymentId);
  }

  // ==================== 统计相关接口 ====================

  @Get('statistics/daily')
  async getDailyStatistics(@Query('date') date?: string) {
    return this.paymentService.getDailyStatistics(date);
  }

  @Get('statistics/summary')
  async getPaymentSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.paymentService.getPaymentSummary(startDate, endDate);
  }
}
