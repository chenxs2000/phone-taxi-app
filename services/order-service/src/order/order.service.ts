import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './entities/order.entity';
import { OrderStatus, OrderType, CarType } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';

// 工具函数 - 直接定义以避免导入问题
function generateOrderNo(): string {
  const prefix = 'TAXI';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

function calculateEstimatedFare(distance: number, duration: number, carType: number): number {
  const baseFare = 20; // 起步价
  const distanceFare = (distance / 1000) * 2; // 距离费用
  const timeFare = (duration / 60) * 1; // 时间费用
  const carTypeMultiplier =
    carType === CarType.COMFORT ? 1.5 : carType === CarType.ACCESSIBLE ? 2 : 1;
  return Math.ceil((baseFare + distanceFare + timeFare) * carTypeMultiplier);
}

function successResponse(data: any) {
  return {
    success: true,
    data,
    message: '操作成功',
  };
}

function errorResponse(code: number, message: string) {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

const ERROR_CODES = {
  INVALID_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNAUTHORIZED: 401,
  ORDER_NOT_FOUND: 1001,
  ORDER_STATUS_ERROR: 1002,
  ORDER_CANCELLED: 1003,
  INVALID_PARAMS: 1004,
};

const MESSAGES = {
  ORDER_NOT_FOUND: '订单不存在',
  ORDER_ALREADY_EXISTS: '订单已存在',
  INVALID_STATUS: '订单状态不允许此操作',
};

@Injectable()
export class OrderService {
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

  /**
   * 创建订单
   * 对应测试用例: TC-ORDER-001 ~ TC-ORDER-003
   */
  async createOrder(createOrderDto: CreateOrderDto) {
    const { userId, pickup, destination, carType, passengerCount, orderType, bookingTime } =
      createOrderDto;

    // 1. 创建订单
    const newOrder = new this.orderModel({
      userId,
      pickup,
      destination,
      carType: carType || CarType.NORMAL,
      passengerCount: passengerCount || 1,
      orderType: orderType || OrderType.INSTANT,
      bookingTime: bookingTime ? new Date(bookingTime) : undefined,
      orderStatus: OrderStatus.PENDING_DISPATCH,
      fare: {
        estimated: calculateEstimatedFare(this.calculateDistance(pickup, destination), 1800, carType || CarType.NORMAL),
      },
    });

    await newOrder.save();

    const orderObj = newOrder.toObject();
    return successResponse({
      orderId: orderObj._id.toString(),
      orderNo: orderObj.orderNo,
      userId: orderObj.userId,
      status: orderObj.orderStatus,
      estimatedFare: orderObj.fare.estimated,
      createdAt: orderObj.createdAt,
    });
  }

  /**
   * 获取订单详情
   * 对应测试用例: TC-ORDER-004
   */
  async getOrderDetail(orderId: string) {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(errorResponse(ERROR_CODES.ORDER_NOT_FOUND, '订单不存在'));
    }

    const orderObj = order.toObject();
    return successResponse({
      orderId: orderObj._id.toString(),
      orderNo: orderObj.orderNo,
      userId: orderObj.userId,
      driverId: orderObj.driverId,
      pickup: orderObj.pickup,
      destination: orderObj.destination,
      orderType: orderObj.orderType,
      carType: orderObj.carType,
      passengerCount: orderObj.passengerCount,
      createTime: orderObj.createdAt,
      bookingTime: orderObj.bookingTime,
      dispatchTime: orderObj.dispatchTime,
      acceptTime: orderObj.acceptTime,
      arriveTime: orderObj.arriveTime,
      startTime: orderObj.startTime,
      endTime: orderObj.endTime,
      orderStatus: orderObj.orderStatus,
      fare: orderObj.fare,
      distance: orderObj.distance,
      duration: orderObj.duration,
      payment: orderObj.payment,
      rating: orderObj.rating,
      comment: orderObj.comment,
      statusLogs: orderObj.statusLogs,
    });
  }

  /**
   * 获取用户订单列表
   * 对应测试用例: TC-ORDER-005 ~ TC-ORDER-006
   */
  async getUserOrders(
    userId: string,
    status?: OrderStatus,
    page: number = 1,
    pageSize: number = 20
  ) {
    const query: any = { userId };
    if (status !== undefined) {
      query.orderStatus = status;
    }

    const total = await this.orderModel.countDocuments(query);
    const list = await this.orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return successResponse({
      list: list.map(order => ({
        orderId: order._id.toString(),
        orderNo: order.orderNo,
        status: order.orderStatus,
        fare: order.fare,
        pickup: order.pickup,
        destination: order.destination,
        createdAt: order.createdAt,
      })),
      total,
      page,
      pageSize,
    });
  }

  /**
   * 修改订单
   * 对应测试用例: TC-ORDER-007 ~ TC-ORDER-009
   */
  async updateOrder(orderId: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(errorResponse(ERROR_CODES.ORDER_NOT_FOUND, '订单不存在'));
    }

    // 只有待派单状态可以修改
    if (order.orderStatus !== OrderStatus.PENDING_DISPATCH) {
      throw new BadRequestException(
        errorResponse(ERROR_CODES.ORDER_STATUS_ERROR, '订单状态不允许修改')
      );
    }

    // 更新允许的字段
    if (updateOrderDto.pickup) {
      order.pickup = updateOrderDto.pickup;
    }
    if (updateOrderDto.destination) {
      order.destination = updateOrderDto.destination;
    }
    if (updateOrderDto.carType) {
      order.carType = updateOrderDto.carType;
    }
    if (updateOrderDto.passengerCount) {
      order.passengerCount = updateOrderDto.passengerCount;
    }

    // 重新计算预估费用
    const distance = this.calculateDistance(
      order.pickup!,
      updateOrderDto.destination || order.destination
    );
    order.fare!.estimated = calculateEstimatedFare(distance, 1800, order.carType || CarType.NORMAL);

    await order.save();

    const orderObj = order.toObject();
    return successResponse({
      orderId: orderObj._id.toString(),
      orderNo: orderObj.orderNo,
      updatedFare: orderObj.fare.estimated,
    });
  }

  /**
   * 取消订单
   * 对应测试用例: TC-ORDER-010 ~ TC-ORDER-012
   */
  async cancelOrder(orderId: string, cancelDto: CancelOrderDto, cancelBy: number, userId: string) {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(errorResponse(ERROR_CODES.ORDER_NOT_FOUND, '订单不存在'));
    }

    // 检查是否可以取消
    const now = new Date();
    const canCancel = this.checkCanCancel(order, now, cancelBy);
    if (!canCancel) {
      throw new BadRequestException(errorResponse(ERROR_CODES.ORDER_CANCELLED, '订单不能取消'));
    }

    // 更新订单状态
    order.orderStatus = OrderStatus.CANCELLED;
    order.cancel = {
      reason: cancelDto.reason,
      by: cancelBy,
    };

    await order.save();

    const orderObj = order.toObject();
    return successResponse({
      orderId: orderObj._id.toString(),
      orderNo: orderObj.orderNo,
      status: orderObj.orderStatus,
      refundAmount: this.calculateRefundAmount(order),
    });
  }

  /**
   * 订单状态流转
   * 对应测试用例: TC-ORDER-013 ~ TC-ORDER-014
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    operatorId?: string,
    operatorType?: number,
    remark?: string
  ) {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(errorResponse(ERROR_CODES.ORDER_NOT_FOUND, '订单不存在'));
    }

    const oldStatus = order.orderStatus;

    // 验证状态流转的合法性
    if (!this.isValidStatusTransition(oldStatus, newStatus)) {
      throw new BadRequestException(
        errorResponse(ERROR_CODES.ORDER_STATUS_ERROR, '非法的状态流转')
      );
    }

    // 记录状态变更
    if (!order.statusLogs) {
      order.statusLogs = [];
    }
    order.statusLogs.push({
      oldStatus,
      newStatus,
      operatorId: operatorId ? new mongoose.Types.ObjectId(operatorId) : undefined,
      operatorType,
      remark,
      createdAt: new Date(),
    });

    order.orderStatus = newStatus;
    await order.save();

    return successResponse({
      orderId: order._id.toString(),
      orderNo: order.orderNo,
      oldStatus,
      newStatus,
    });
  }

  /**
   * 计费
   * 对应测试用例: TC-ORDER-015 ~ TC-ORDER-017
   */
  async calculateFare(orderId: string, distance?: number, duration?: number) {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(errorResponse(ERROR_CODES.ORDER_NOT_FOUND, '订单不存在'));
    }

    // 计算实际费用
    const actualDistance = distance || order.distance || 0;
    const actualDuration = duration || order.duration || 0;

    const baseFare = 13;
    const distanceFare = actualDistance * 0.0023; // 每米 2.3元
    const timeFare = actualDuration * 0.0083; // 每秒 0.5元

    order.fare = {
      estimated: order.fare?.estimated || 0,
      base: baseFare,
      distance: distanceFare,
      time: timeFare,
      actual: baseFare + distanceFare + timeFare,
    };

    await order.save();

    const orderObj = order.toObject();
    return successResponse({
      orderId: orderObj._id.toString(),
      orderNo: orderObj.orderNo,
      fare: orderObj.fare,
    });
  }

  /**
   * 订单评价
   * 对应测试用例: TC-ORDER-018 ~ TC-ORDER-019
   */
  async rateOrder(orderId: string, rating: number, comment?: string) {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(errorResponse(ERROR_CODES.ORDER_NOT_FOUND, '订单不存在'));
    }

    // 只有已完成状态可以评价
    if (order.orderStatus !== OrderStatus.COMPLETED) {
      throw new BadRequestException(
        errorResponse(ERROR_CODES.ORDER_STATUS_ERROR, '只有完成订单可以评价')
      );
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException(errorResponse(ERROR_CODES.INVALID_PARAMS, '评分必须在1-5之间'));
    }

    order.rating = rating;
    order.comment = comment;
    await order.save();

    const orderObj = order.toObject();
    return successResponse({
      orderId: orderObj._id.toString(),
      orderNo: orderObj.orderNo,
      rating,
      comment,
    });
  }

  /**
   * 获取当前未完成订单
   */
  async getCurrentUnfinishedOrder(userId: string) {
    const order = await this.orderModel
      .findOne({
        userId,
        orderStatus: {
          $in: [OrderStatus.PENDING_DISPATCH, OrderStatus.PENDING_ACCEPT, OrderStatus.ACCEPTED],
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    if (!order) {
      return successResponse(null);
    }

    const orderObj = order.toObject();
    return successResponse({
      orderId: orderObj._id.toString(),
      orderNo: orderObj.orderNo,
      status: orderObj.orderStatus,
      pickup: orderObj.pickup,
      destination: orderObj.destination,
      driverId: orderObj.driverId,
    });
  }

  /**
   * 计算两点间距离
   */
  private calculateDistance(
    pickup: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): number {
    const R = 6371000;
    const dLat = this.toRadians(destination.lat - pickup.lat);
    const dLng = this.toRadians(destination.lng - pickup.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(pickup.lat)) *
        Math.cos(this.toRadians(destination.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 检查是否可以取消订单
   */
  private checkCanCancel(order: Order, now: Date, cancelBy: number): boolean {
    // 已取消的订单不能再次取消
    if (order.orderStatus === OrderStatus.CANCELLED) {
      return false;
    }

    // 计算订单已过时间（分钟）
    const elapsedMinutes = (now.getTime() - order.createTime.getTime()) / 60000;

    // 乘客取消：5分钟内免费
    if (cancelBy === 1 && elapsedMinutes <= 5) {
      return true;
    }

    // 司机取消：3分钟内免费
    if (cancelBy === 2 && elapsedMinutes <= 3) {
      return true;
    }

    return false;
  }

  /**
   * 验证状态流转是否合法
   */
  private isValidStatusTransition(oldStatus: OrderStatus, newStatus: OrderStatus): boolean {
    // 定义允许的状态流转
    const validTransitions: Record<number, OrderStatus[]> = {
      1: [2, 7, 8], // PENDING_DISPATCH -> PENDING_ACCEPT, CANCELLED, TIMEOUT
      2: [3, 7, 8], // PENDING_ACCEPT -> ACCEPTED, CANCELLED, TIMEOUT
      3: [4, 7], // ACCEPTED -> ARRIVED, CANCELLED
      4: [5, 7], // ARRIVED -> IN_PROGRESS, CANCELLED
      5: [6, 7], // IN_PROGRESS -> COMPLETED, CANCELLED
      6: [], // COMPLETED -> 无后续状态
      7: [], // CANCELLED -> 无后续状态
      8: [], // TIMEOUT -> 无后续状态
    };

    if (!validTransitions[oldStatus]) {
      return false;
    }

    return validTransitions[oldStatus].includes(newStatus);
  }

  /**
   * 计算退款金额
   */
  private calculateRefundAmount(order: Order): number {
    // 如果还没接单，全额退款
    if (!order.acceptTime) {
      return order.fare?.estimated || 0;
    }

    // 如果接单了，根据接单时间计算
    // 简化处理：取消超过免费时间退款20%违约金
    return (order.fare?.estimated || 0) * 0.2;
  }
}
