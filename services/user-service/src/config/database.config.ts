import { registerAs } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export const getMongoConfig = async (
  configService: ConfigService
): Promise<MongooseModuleOptions> => ({
  uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/phone-taxi-app',
  ...getMongooseOptions(),
});

export const getMongooseOptions = () => ({
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export const databaseConfig = registerAs('DATABASE', {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/phone-taxi-app',
});

export const jwtConfig = registerAs('JWT', {
  secret: process.env.JWT_SECRET || 'phone-taxi-app-secret-key-2024',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});
