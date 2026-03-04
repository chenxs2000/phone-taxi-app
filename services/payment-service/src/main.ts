import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // 启用 CORS
  app.enableCors();

  const port = process.env.PORT || 3004;
  await app.listen(port);

  console.log(`支付服务运行在端口 ${port}`);
}

bootstrap();
