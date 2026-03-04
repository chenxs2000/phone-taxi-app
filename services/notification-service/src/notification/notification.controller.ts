import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'notification-service' };
  }

  // ==================== 通知发送接口 ====================

  @Post('send')
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationService.sendNotification(dto);
  }

  @Post('send/batch')
  async sendBatchNotifications(@Body() dtos: SendNotificationDto[]) {
    return this.notificationService.sendBatchNotifications(dtos);
  }

  // ==================== 通知管理接口 ====================

  @Post()
  async createNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationService.createNotification(dto);
  }

  @Get(':notificationId')
  async getNotification(@Param('notificationId') notificationId: string) {
    return this.notificationService.getNotification(notificationId);
  }

  @Get()
  async getNotifications(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('userId') userId?: string,
    @Query('driverId') driverId?: string,
    @Query('agentId') agentId?: string,
    @Query('status') status?: number,
    @Query('type') type?: number
  ) {
    return this.notificationService.getNotifications(page, pageSize, {
      userId,
      driverId,
      agentId,
      status,
      type,
    });
  }

  @Get('user/:userId')
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('unread') unread?: boolean
  ) {
    return this.notificationService.getUserNotifications(userId, page, pageSize, unread);
  }

  @Get('driver/:driverId')
  async getDriverNotifications(
    @Param('driverId') driverId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('unread') unread?: boolean
  ) {
    return this.notificationService.getDriverNotifications(driverId, page, pageSize, unread);
  }

  @Put(':notificationId')
  async updateNotification(
    @Param('notificationId') notificationId: string,
    @Body() dto: UpdateNotificationDto
  ) {
    return this.notificationService.updateNotification(notificationId, dto);
  }

  @Put(':notificationId/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationService.markAsRead(notificationId);
  }

  @Put('user/:userId/read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Param('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Post(':notificationId/resend')
  @HttpCode(HttpStatus.OK)
  async resendNotification(@Param('notificationId') notificationId: string) {
    return this.notificationService.resendNotification(notificationId);
  }

  @Delete(':notificationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(@Param('notificationId') notificationId: string) {
    return this.notificationService.deleteNotification(notificationId);
  }

  // ==================== 统计接口 ====================

  @Get('statistics/unread/:userId')
  async getUnreadCount(@Param('userId') userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }
}
