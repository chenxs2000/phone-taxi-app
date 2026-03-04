import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // 全局前缀
  app.setGlobalPrefix('api');

  // CORS 配置
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger API 文档
  const config = new DocumentBuilder()
    .setTitle('电话打车 API 网关')
    .setDescription('统一API入口，代理所有微服务请求')
    .setVersion('1.0')
    .addTag('user', '用户服务')
    .addTag('order', '订单服务')
    .addTag('driver', '司机服务')
    .addTag('payment', '支付服务')
    .addTag('notification', '通知服务')
    .addTag('statistics', '统计服务')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API网关启动成功，端口: ${port}`);
  console.log(`\n微服务地址:`);
  console.log(`  - 用户服务: ${process.env.USER_SERVICE_URL || 'http://localhost:3001'}`);
  console.log(`  - 订单服务: ${process.env.ORDER_SERVICE_URL || 'http://localhost:3002'}`);
  console.log(`  - 派单服务: ${process.env.DISPATCH_SERVICE_URL || 'http://localhost:3003'}`);
  console.log(`  - 支付服务: ${process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004'}`);
  console.log(`  - 通知服务: ${process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005'}`);
  console.log(`  - 统计服务: ${process.env.STATISTICS_SERVICE_URL || 'http://localhost:3006'}`);
  console.log(`\\nAPI文档: http://localhost:${port}/api/docs`);
}

bootstrap();
