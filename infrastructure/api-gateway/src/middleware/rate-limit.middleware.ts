import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// 限流配置
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly store = new Map<string, { count: number; lastReset: number }>();

  use(req: Request, res: Response, next: NextFunction) {
    // 默认限流配置
    const config: RateLimitConfig = {
      windowMs: 60000, // 1分钟
      maxRequests: 100,
    };

    const key = (req.ip || req.connection.remoteAddress || 'unknown') as string;
    const now = Date.now();
    const record = this.store.get(key) || { count: 0, lastReset: now };

    // 检查是否在时间窗口内
    if (now - record.lastReset > config.windowMs) {
      record.count = 1;
      record.lastReset = now;
    } else {
      record.count++;
    }

    this.store.set(key, record);

    // 检查是否超过限制
    if (record.count > config.maxRequests) {
      throw new HttpException({
        code: HttpStatus.TOO_MANY_REQUESTS,
        message: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil((config.windowMs - (now - record.lastReset)) / 1000),
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    next();
  }
}
