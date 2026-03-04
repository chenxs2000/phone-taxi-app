import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  HttpException,
  Headers,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from './config/app.config';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { Response } from 'express';

// 白名单路径（不需要认证）
const WHITE_LIST = [
  '/api/v1/user/register',
  '/api/v1/user/login',
  '/api/v1/user/send-verify-code',
  '/api/v1/user/verify-code',
  '/health',
  '/',
];

/**
 * API Gateway Controller
 * 负责路由转发、负载均衡、认证转发
 */
@Controller()
export class AppGateway {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService
  ) {}

  /**
   * 健康检查端点
   */
  @Get('health')
  healthCheck() {
    return {
      code: HttpStatus.OK,
      message: 'API网关运行正常',
      timestamp: Date.now(),
      data: {
        services: Object.keys(this.config.getAllServices()),
        uptime: process.uptime(),
        version: '1.0.0',
      },
    };
  }

  /**
   * API 网关根路径
   */
  @Get()
  getRoot() {
    return {
      code: HttpStatus.OK,
      message: '欢迎使用 Phone Taxi API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        user: '/api/v1/user/*',
        order: '/api/v1/order/*',
        driver: '/api/v1/driver/*',
        payment: '/api/v1/payment/*',
        notification: '/api/v1/notification/*',
        statistics: '/api/v1/statistics/*',
      },
    };
  }

  /**
   * 通用代理请求方法
   * @param serviceName 服务名称（如 userService）
   * @param path 请求路径
   * @param method HTTP 方法
   * @param req 原始请求
   * @param headers 请求头
   * @param body 请求体
   */
  private async proxyRequest(
    serviceName: string,
    path: string,
    method: string,
    req: any,
    headers: any,
    body?: any
  ) {
    const allServices = this.config.getAllServices();
    const serviceUrl = allServices[serviceName as keyof typeof allServices];

    if (!serviceUrl) {
      throw new HttpException(`服务 ${serviceName} 未配置`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      // 准备请求头（过滤掉可能造成问题的头）
      const proxyHeaders: Record<string, string> = {};
      Object.keys(headers).forEach(key => {
        if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
          proxyHeaders[key] = headers[key];
        }
      });

      // 发送请求
      const response = await this.httpService.axiosRef({
        method: method as any,
        url: `${serviceUrl}${path}`,
        headers: proxyHeaders,
        data: body,
        validateStatus: () => true, // 不抛出 HTTP 错误，由我们处理
      });

      // 返回服务响应
      return response.data;
    } catch (error: any) {
      console.error(`代理请求失败 [${serviceName}] ${path}:`, error.message);

      // 处理连接错误
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new HttpException(`服务 ${serviceName} 暂时不可用`, HttpStatus.SERVICE_UNAVAILABLE);
      }

      // 处理超时
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        throw new HttpException(`服务 ${serviceName} 响应超时`, HttpStatus.GATEWAY_TIMEOUT);
      }

      // 其他错误
      throw new HttpException('内部服务错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 判断路径是否在白名单中
   */
  private isWhitelisted(path: string): boolean {
    return WHITE_LIST.some(route => path.startsWith(route));
  }

  /**
   * ==================== 用户服务路由 ====================
   */

  /**
   * GET 请求 - 用户服务（需要认证）
   */
  @Get('api/v1/user/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyUserGet(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/user', '');

    const data = await this.proxyRequest('userService', path, 'GET', req, req.headers);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * POST 请求 - 用户注册（白名单，无需认证）
   */
  @Post('api/v1/user/register')
  async proxyUserRegister(@Req() req: any, @Res() res: Response) {
    const path = '/register';

    const data = await this.proxyRequest('userService', path, 'POST', req, req.headers, req.body);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * POST 请求 - 用户登录（白名单，无需认证）
   */
  @Post('api/v1/user/login')
  async proxyUserLogin(@Req() req: any, @Res() res: Response) {
    const path = '/login';

    const data = await this.proxyRequest('userService', path, 'POST', req, req.headers, req.body);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * POST 请求 - 发送验证码（白名单，无需认证）
   */
  @Post('api/v1/user/send-verify-code')
  async proxyUserSendCode(@Req() req: any, @Res() res: Response) {
    const path = '/send-verify-code';

    const data = await this.proxyRequest('userService', path, 'POST', req, req.headers, req.body);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * POST 请求 - 验证验证码（白名单，无需认证）
   */
  @Post('api/v1/user/verify-code')
  async proxyUserVerifyCode(@Req() req: any, @Res() res: Response) {
    const path = '/verify-code';

    const data = await this.proxyRequest('userService', path, 'POST', req, req.headers, req.body);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * POST 请求 - 用户服务（需要认证）
   */
  @Post('api/v1/user/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyUserPost(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/user', '');

    const data = await this.proxyRequest('userService', path, 'POST', req, req.headers, req.body);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * PUT 请求 - 用户服务（需要认证）
   */
  @Put('api/v1/user/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyUserPut(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/user', '');

    const data = await this.proxyRequest('userService', path, 'PUT', req, req.headers, req.body);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * DELETE 请求 - 用户服务（需要认证）
   */
  @Delete('api/v1/user/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyUserDelete(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/user', '');

    const data = await this.proxyRequest('userService', path, 'DELETE', req, req.headers);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * ==================== 订单服务路由 ====================
   */

  /**
   * GET 请求 - 订单服务（需要认证）
   */
  @Get('api/v1/order/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyOrderGet(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/order', '');

    const data = await this.proxyRequest('orderService', path, 'GET', req, req.headers);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * POST 请求 - 订单服务（需要认证）
   */
  @Post('api/v1/order/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyOrderPost(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/order', '');

    const data = await this.proxyRequest('orderService', path, 'POST', req, req.headers, req.body);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * PUT 请求 - 订单服务（需要认证）
   */
  @Put('api/v1/order/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyOrderPut(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/order', '');

    const data = await this.proxyRequest('orderService', path, 'PUT', req, req.headers, req.body);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * DELETE 请求 - 订单服务（需要认证）
   */
  @Delete('api/v1/order/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyOrderDelete(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/order', '');

    const data = await this.proxyRequest('orderService', path, 'DELETE', req, req.headers);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * PATCH 请求 - 订单服务（需要认证）
   */
  @Patch('api/v1/order/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyOrderPatch(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/order', '');

    const data = await this.proxyRequest('orderService', path, 'PATCH', req, req.headers, req.body);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * ==================== 派单服务路由（司机） ====================
   */

  /**
   * GET 请求 - 派单服务（需要认证）
   */
  @Get('api/v1/driver/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyDriverGet(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/driver', '');

    const data = await this.proxyRequest('dispatchService', path, 'GET', req, req.headers);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * POST 请求 - 派单服务（需要认证）
   */
  @Post('api/v1/driver/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyDriverPost(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/driver', '');

    const data = await this.proxyRequest(
      'dispatchService',
      path,
      'POST',
      req,
      req.headers,
      req.body
    );

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * PUT 请求 - 派单服务（需要认证）
   */
  @Put('api/v1/driver/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyDriverPut(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/driver', '');

    const data = await this.proxyRequest(
      'dispatchService',
      path,
      'PUT',
      req,
      req.headers,
      req.body
    );

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * ==================== 支付服务路由 ====================
   */

  /**
   * GET 请求 - 支付服务（需要认证）
   */
  @Get('api/v1/payment/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyPaymentGet(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/payment', '');

    const data = await this.proxyRequest('paymentService', path, 'GET', req, req.headers);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * POST 请求 - 支付服务（需要认证）
   */
  @Post('api/v1/payment/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyPaymentPost(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/payment', '');

    const data = await this.proxyRequest(
      'paymentService',
      path,
      'POST',
      req,
      req.headers,
      req.body
    );

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * PUT 请求 - 支付服务（需要认证）
   */
  @Put('api/v1/payment/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyPaymentPut(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/payment', '');

    const data = await this.proxyRequest('paymentService', path, 'PUT', req, req.headers, req.body);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * ==================== 通知服务路由 ====================
   */

  /**
   * POST 请求 - 通知服务（需要认证）
   */
  @Post('api/v1/notification/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyNotificationPost(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/notification', '');

    const data = await this.proxyRequest(
      'notificationService',
      path,
      'POST',
      req,
      req.headers,
      req.body
    );

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * ==================== 统计服务路由 ====================
   */

  /**
   * GET 请求 - 统计服务（需要认证）
   */
  @Get('api/v1/statistics/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyStatisticsGet(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/statistics', '');

    const data = await this.proxyRequest('statisticsService', path, 'GET', req, req.headers);

    return res.status(HttpStatus.OK).json(data);
  }

  /**
   * POST 请求 - 统计服务（需要认证）
   */
  @Post('api/v1/statistics/:path*')
  @UseGuards(JwtAuthGuard)
  async proxyStatisticsPost(@Req() req: any, @Res() res: Response) {
    const path = req.originalUrl.replace('/api/v1/statistics', '');

    const data = await this.proxyRequest(
      'statisticsService',
      path,
      'POST',
      req,
      req.headers,
      req.body
    );

    return res.status(HttpStatus.OK).json(data);
  }
}
