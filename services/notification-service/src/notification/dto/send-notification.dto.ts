import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { NotificationType, NotificationChannel } from '../entities/notification.entity';

export class SendNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsArray()
  @IsString({ each: true })
  recipientIds: string[];

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsString()
  @IsOptional()
  templateId?: string;
}
