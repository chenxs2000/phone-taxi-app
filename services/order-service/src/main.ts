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
  app.setGlobalPrefix('api/v1');

  // Swagger API 文档
  const config = new DocumentBuilder()
    .setTitle('电话打车订单服务')
    .setDescription('订单管理相关 API')
    .setVersion('1.0')
    .addTag('order', '订单管理')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 启用 CORS
  app.enableCors();

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`订单服务启动成功，端口: ${port}`);
}

bootstrap();
