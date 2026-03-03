import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { OrderModule } from './order/order.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot(databaseConfig),
    MongooseModule.forRoot(databaseConfig),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'phone-taxi-app-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    PassportModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
