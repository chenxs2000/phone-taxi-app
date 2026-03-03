import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentStatus, PaymentType } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ProcessPaymentDto, RefundPaymentDto } from './dto/process-payment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
  ) {}

  async createPayment(dto: CreatePaymentDto) {
    // 检查订单是否已有支付记录
    const existingPayment = await this.paymentModel.findOne({ orderId: dto.orderId });
    if (existingPayment) {
      throw new BadRequestException('该订单已存在支付记录');
    }

    const payment = new this.paymentModel({
      paymentId: uuidv4(),
      orderId: dto.orderId,
      paymentType: dto.paymentType,
      amount: dto.amount,
      status: PaymentStatus.PENDING,
      remarks: dto.remarks,
    });

    return payment.save();
  }

  async getPayment(paymentId: string) {
    const payment = await this.paymentModel.findOne({ paymentId });
    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }
    return payment;
  }

  async getPaymentByOrderId(orderId: string) {
    const payment = await this.paymentModel.findOne({ orderId });
    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }
    return payment;
  }

  async getPayments(
    page: number,
    pageSize: number,
    status?: number,
    paymentType?: number,
    userId?: string,
  ) {
    const filter: any = {};
    if (status !== undefined) {
      filter.status = status;
    }
    if (paymentType !== undefined) {
      filter.paymentType = paymentType;
    }
    if (userId) {
      filter.userId = userId;
    }

    const skip = (page - 1) * pageSize;
    const [payments, total] = await Promise.all([
      this.paymentModel.find(filter).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
      this.paymentModel.countDocuments(filter),
    ]);

    return {
      list: payments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updatePayment(paymentId: string, dto: UpdatePaymentDto) {
    const payment = await this.getPayment(paymentId);
    Object.assign(payment, dto);
    await payment.save();
    return payment;
  }

  async processPayment(paymentId: string, dto: ProcessPaymentDto) {
    const payment = await this.getPayment(paymentId);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('支付状态不允许处理');
    }

    payment.status = PaymentStatus.PAID;
    payment.paymentTime = new Date();
    if (dto.transactionId) {
      payment.transactionId = dto.transactionId;
    }

    await payment.save();

    // TODO: 发送支付成功通知
    // this.notificationService.sendPaymentSuccessNotification(payment);

    // TODO: 更新订单状态
    // this.orderService.updateOrderStatus(payment.orderId, OrderStatus.COMPLETED);

    return payment;
  }

  async refundPayment(paymentId: string, dto: RefundPaymentDto) {
    const payment = await this.getPayment(paymentId);

    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('只有已支付的订单才能退款');
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.remarks = dto.reason || payment.remarks;

    await payment.save();

    // TODO: 发送退款通知
    // this.notificationService.sendRefundNotification(payment);

    // TODO: 更新订单状态
    // this.orderService.updateOrderStatus(payment.orderId, OrderStatus.CANCELLED);

    return payment;
  }

  async deletePayment(paymentId: string) {
    await this.paymentModel.deleteOne({ paymentId });
  }

  async getDailyStatistics(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = this.paymentModel.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    const payments = await query.exec(); // 使用 exec() 转换为数组

    const statistics = {
      date: startOfDay.toISOString().split('T')[0],
      totalPayments: payments.length,
      paidCount: payments.filter((p) => p.status === PaymentStatus.PAID).length,
      refundedCount: payments.filter((p) => p.status === PaymentStatus.REFUNDED).length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      paidAmount: payments
        .filter((p) => p.status === PaymentStatus.PAID)
        .reduce((sum, p) => sum + p.amount, 0),
      refundedAmount: payments
        .filter((p) => p.status === PaymentStatus.REFUNDED)
        .reduce((sum, p) => sum + p.amount, 0),
      paymentTypes: {
        cash: payments.filter((p) => p.paymentType === PaymentType.CASH).length,
        deputy: payments.filter((p) => p.paymentType === PaymentType.DEPUTY).length,
        account: payments.filter((p) => p.paymentType === PaymentType.ACCOUNT).length,
      },
    };

    return statistics;
  }

  async getPaymentSummary(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const query = this.paymentModel.find({
      createdAt: { $gte: start, $lte: end },
    });
    const payments = await query.exec(); // 使用 exec() 转换为数组

    const summary = {
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      overview: {
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      },
      statusBreakdown: {
        pending: payments.filter((p) => p.status === PaymentStatus.PENDING).length,
        paid: payments.filter((p) => p.status === PaymentStatus.PAID).length,
        refunded: payments.filter((p) => p.status === PaymentStatus.REFUNDED).length,
        cancelled: payments.filter((p) => p.status === PaymentStatus.CANCELLED).length,
      },
      typeBreakdown: {
        cash: {
          count: payments.filter((p) => p.paymentType === PaymentType.CASH).length,
          amount: payments
            .filter((p) => p.paymentType === PaymentType.CASH)
            .reduce((sum, p) => sum + p.amount, 0),
        },
        deputy: {
          count: payments.filter((p) => p.paymentType === PaymentType.DEPUTY).length,
          amount: payments
            .filter((p) => p.paymentType === PaymentType.DEPUTY)
            .reduce((sum, p) => sum + p.amount, 0),
        },
        account: {
          count: payments.filter((p) => p.paymentType === PaymentType.ACCOUNT).length,
          amount: payments
            .filter((p) => p.paymentType === PaymentType.ACCOUNT)
            .reduce((sum, p) => sum + p.amount, 0),
        },
      },
    };

    return summary;
  }
}
