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
import { DispatchService } from './dispatch.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { DispatchOrderDto } from './dto/dispatch-order.dto';
import {
  UpdateDriverStatusDto,
  UpdateDriverLocationDto,
  FindNearbyDriversDto,
} from './dto/driver-status.dto';

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'dispatch-service' };
  }

  // ==================== 派单相关接口 ====================

  @Post('dispatch')
  async dispatchOrder(@Body() dto: DispatchOrderDto) {
    return this.dispatchService.dispatchOrder(dto);
  }

  @Post('dispatch/batch')
  async batchDispatch(@Body() dto: { orderId: string; carType?: string; maxDrivers?: number }) {
    return this.dispatchService.batchDispatch(dto.orderId, dto.carType, dto.maxDrivers);
  }

  @Get('dispatch/:dispatchId')
  async getDispatch(@Param('dispatchId') dispatchId: string) {
    return this.dispatchService.getDispatch(dispatchId);
  }

  @Get('dispatch/order/:orderId')
  async getDispatchByOrderId(@Param('orderId') orderId: string) {
    return this.dispatchService.getDispatchByOrderId(orderId);
  }

  @Put('dispatch/:dispatchId')
  async updateDispatch(@Param('dispatchId') dispatchId: string, @Body() dto: UpdateDispatchDto) {
    return this.dispatchService.updateDispatch(dispatchId, dto);
  }

  @Put('dispatch/:dispatchId/accept')
  @HttpCode(HttpStatus.OK)
  async acceptDispatch(@Param('dispatchId') dispatchId: string) {
    return this.dispatchService.acceptDispatch(dispatchId);
  }

  @Put('dispatch/:dispatchId/reject')
  @HttpCode(HttpStatus.OK)
  async rejectDispatch(@Param('dispatchId') dispatchId: string) {
    return this.dispatchService.rejectDispatch(dispatchId);
  }

  @Delete('dispatch/:dispatchId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDispatch(@Param('dispatchId') dispatchId: string) {
    return this.dispatchService.deleteDispatch(dispatchId);
  }

  // ==================== 司机相关接口 ====================

  @Post('driver')
  async createDriver(@Body() dto: any) {
    return this.dispatchService.createDriver(dto);
  }

  @Get('driver/:driverId')
  async getDriver(@Param('driverId') driverId: string) {
    return this.dispatchService.getDriver(driverId);
  }

  @Put('driver/:driverId/status')
  @HttpCode(HttpStatus.OK)
  async updateDriverStatus(
    @Param('driverId') driverId: string,
    @Body() dto: UpdateDriverStatusDto
  ) {
    return this.dispatchService.updateDriverStatus(driverId, dto);
  }

  @Put('driver/:driverId/location')
  @HttpCode(HttpStatus.OK)
  async updateDriverLocation(
    @Param('driverId') driverId: string,
    @Body() dto: UpdateDriverLocationDto
  ) {
    return this.dispatchService.updateDriverLocation(driverId, dto);
  }

  @Get('drivers/nearby')
  async findNearbyDrivers(@Query() query: FindNearbyDriversDto) {
    return this.dispatchService.findNearbyDrivers(query);
  }

  @Get('drivers/available')
  async getAvailableDrivers(@Query('carType') carType?: string) {
    return this.dispatchService.getAvailableDrivers(carType);
  }

  @Get('drivers')
  async getDrivers(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('status') status?: number,
    @Query('carType') carType?: number
  ) {
    return this.dispatchService.getDrivers(page, pageSize, status, carType);
  }

  @Delete('driver/:driverId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDriver(@Param('driverId') driverId: string) {
    return this.dispatchService.deleteDriver(driverId);
  }
}
