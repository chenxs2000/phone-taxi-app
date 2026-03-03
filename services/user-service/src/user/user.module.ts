import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/jwt.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserSchema } from './entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'phone-taxi-app-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    PassportModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, JwtAuthGuard],
  exports: [UserService, JwtAuthGuard],
})
export class UserModule {}
