import { Injectable } from '@nestjs/common';

// 服务配置接口
interface ServiceConfig {
  userService: string;
  orderService: string;
  dispatchService: string;
  paymentService: string;
  notificationService: string;
  statisticsService: string;
}

/**
 * 配置服务
 * 管理所有微服务的 URL 配置
 */
@Injectable()
export class ConfigService {
  private readonly services: ServiceConfig;

  constructor() {
    // 微服务端口配置
    this.services = {
      userService: process.env.USER_SERVICE_URL || 'http://localhost:3001',
      orderService: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
      dispatchService: process.env.DISPATCH_SERVICE_URL || 'http://localhost:3003',
      paymentService: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
      notificationService: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
      statisticsService: process.env.STATISTICS_SERVICE_URL || 'http://localhost:3006',
    };
  }

  get userService(): string {
    return this.services.userService;
  }

  get orderService(): string {
    return this.services.orderService;
  }

  get dispatchService(): string {
    return this.services.dispatchService;
  }

  get paymentService(): string {
    return this.services.paymentService;
  }

  get notificationService(): string {
    return this.services.notificationService;
  }

  get statisticsService(): string {
    return this.services.statisticsService;
  }

  get jwtSecret(): string {
    return process.env.JWT_SECRET || 'phone-taxi-app-secret-key';
  }

  get jwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '7d';
  }

  /**
   * 获取所有服务配置
   */
  getAllServices(): ServiceConfig {
    return { ...this.services };
  }
}
