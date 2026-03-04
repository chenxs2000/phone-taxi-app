import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AppGateway } from './app.gateway';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { ConfigService } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule.register({
      timeout: 30000, // 30秒超时
      maxRedirects: 5,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'phone-taxi-app-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [AppGateway],
  providers: [ConfigService, RateLimitMiddleware],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // 配置限流中间件
    consumer
      .apply(RateLimitMiddleware)
      .exclude(
        'api/v1/user/register',
        'api/v1/user/login',
        'api/v1/user/send-verify-code',
        'health'
      )
      .forRoutes('*');
  }
}
