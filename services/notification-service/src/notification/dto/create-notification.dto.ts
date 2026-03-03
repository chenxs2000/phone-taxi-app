import { IsString, IsEnum, IsOptional } from 'class-validator';
import { NotificationType, NotificationChannel } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  driverId?: string;

  @IsString()
  @IsOptional()
  agentId?: string;

  @IsString()
  @IsOptional()
  orderId?: string;
}
