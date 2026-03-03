import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../services/user-service/src/auth/jwt.strategy';
import { JwtAuthGuard } from '../../services/user-service/src/auth/jwt-auth.guard';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { OrderSchema } from './entities/order.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'phone-taxi-app-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    PassportModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, JwtStrategy, JwtAuthGuard],
  exports: [OrderService, JwtAuthGuard],
})
export class OrderModule {}
