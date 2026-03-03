import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../services/user-service/src/auth/jwt-auth.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { successResponse } from '../../../shared/utils';

@ApiTags('订单管理')
@Controller('order')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 创建订单
   * 对应测试用例: TC-ORDER-001 ~ TC-ORDER-003
   */
  @Post('create')
  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 201, description: '订单创建成功' })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.createOrder(createOrderDto);
  }

  /**
   * 获取订单详情
   * 对应测试用例: TC-ORDER-004
   * 需要认证
   */
  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getOrderDetail(@Param('id') orderId: string) {
    return await this.orderService.getOrderDetail(orderId);
  }

  /**
   * 获取用户订单列表
   * 对应测试用例: TC-ORDER-005 ~ TC-ORDER-006
   * 需要认证
   */
  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户订单列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getUserOrders(
    @Param('userId') userId: string,
    @Body('status') status?: string,
    @Body('page') page?: number,
    @Body('pageSize') pageSize?: number,
  ) {
    return await this.orderService.getUserOrders(userId, status, page, pageSize);
  }

  /**
   * 获取当前未完成订单
   * 需要认证
   */
  @Get('current/:userId')
  @ApiOperation({ summary: '获取当前未完成订单' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getCurrentOrder(@Param('userId') userId: string) {
    return await this.orderService.getCurrentUnfinishedOrder(userId);
  }

  /**
   * 修改订单
   * 对应测试用例: TC-ORDER-007 ~ TC-ORDER-009
   * 需要认证
   */
  @Put(':id')
  @ApiOperation({ summary: '修改订单' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: '修改成功' })
  async updateOrder(
    @Param('id') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.orderService.updateOrder(orderId, updateOrderDto);
  }

  /**
   * 取消订单
   * 对应测试用例: TC-ORDER-010 ~ TC-ORDER-012
   * 需要认证
   */
  @Post(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  @ApiBody({ type: CancelOrderDto })
  @ApiResponse({ status: 200, description: '取消成功' })
  async cancelOrder(
    @Param('id') orderId: string,
    @Body() cancelDto: CancelOrderDto,
    @Body('cancelBy') cancelBy: number = 1, // 1-乘客 2-司机
  ) {
    return await this.orderService.cancelOrder(orderId, cancelDto, cancelBy);
  }

  /**
   * 订单计费
   * 对应测试用例: TC-ORDER-015 ~ TC-ORDER-017
   */
  @Post(':id/calculate-fare')
  @ApiOperation({ summary: '计算订单费用' })
  @ApiResponse({ status: 200, description: '计费成功' })
  async calculateFare(@Param('id') orderId: string) {
    return await this.orderService.calculateFare(orderId);
  }

  /**
   * 订单评价
   * 对应测试用例: TC-ORDER-018 ~ TC-ORDER-019
   * 需要认证
   */
  @Post(':id/rate')
  @ApiOperation({ summary: '订单评价' })
  @ApiResponse({ status: 200, description: '评价成功' })
  async rateOrder(
    @Param('id') orderId: string,
    @Body('rating') rating: number,
    @Body('comment') comment?: string,
  ) {
    return await this.orderService.rateOrder(orderId, { rating, comment });
  }
}
