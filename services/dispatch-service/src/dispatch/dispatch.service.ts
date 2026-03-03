import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Driver, DriverStatus, CarType } from './entities/driver.entity';
import { Dispatch, DispatchStatus } from './entities/dispatch.entity';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { DispatchOrderDto } from './dto/dispatch-order.dto';
import {
  UpdateDriverStatusDto,
  UpdateDriverLocationDto,
  FindNearbyDriversDto,
} from './dto/driver-status.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DispatchService {
  constructor(
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(Dispatch.name) private dispatchModel: Model<Dispatch>,
  ) {}

  // ==================== 派单相关方法 ====================

  async dispatchOrder(dto: DispatchOrderDto) {
    // 查找附近的可用司机
    const nearbyDrivers = await this.findNearbyDriversInternal({
      latitude: dto.location || '0',
      longitude: '0',
      carType: dto.carType,
      radius: dto.maxDistance || 5000,
    });

    if (nearbyDrivers.length === 0) {
      throw new NotFoundException('附近没有可用的司机');
    }

    // 筛选在线且空闲的司机
    const availableDrivers = nearbyDrivers.filter(
      (d) => d.isOnline && d.status === DriverStatus.IDLE,
    );

    if (availableDrivers.length === 0) {
      throw new NotFoundException('附近没有空闲的司机');
    }

    // 限制派单数量
    const driversToDispatch = availableDrivers.slice(0, dto.maxDrivers || 3);

    const dispatchRecords = [];

    // 为每个司机创建派单记录
    for (const driver of driversToDispatch) {
      const dispatchId = uuidv4();
      const dispatch = new this.dispatchModel({
        dispatchId,
        orderId: dto.orderId,
        driverId: driver.driverId,
        status: DispatchStatus.DISPATCHED,
        assignedAt: new Date(),
        timeoutSeconds: 30,
      });

      await dispatch.save();
      dispatchRecords.push(dispatch);

      // TODO: 发送派单通知给司机
      // this.notificationService.sendDispatchNotification(driver, dto.orderId);
    }

    return {
      orderId: dto.orderId,
      dispatchedCount: dispatchRecords.length,
      dispatches: dispatchRecords,
    };
  }

  async batchDispatch(orderId: string, carType?: string, maxDrivers: number = 3) {
    return this.dispatchOrder({ orderId, carType, maxDrivers });
  }

  async getDispatch(dispatchId: string) {
    const dispatch = await this.dispatchModel.findOne({ dispatchId });
    if (!dispatch) {
      throw new NotFoundException('派单记录不存在');
    }
    return dispatch;
  }

  async getDispatchByOrderId(orderId: string) {
    const dispatches = await this.dispatchModel.find({ orderId });
    return dispatches;
  }

  async updateDispatch(dispatchId: string, dto: UpdateDispatchDto) {
    const dispatch = await this.getDispatch(dispatchId);
    Object.assign(dispatch, dto);
    await dispatch.save();
    return dispatch;
  }

  async acceptDispatch(dispatchId: string) {
    const dispatch = await this.getDispatch(dispatchId);

    if (dispatch.status !== DispatchStatus.DISPATCHED) {
      throw new BadRequestException('该派单状态不允许接受');
    }

    // 检查超时
    const now = new Date();
    const assignedAt = dispatch.assignedAt;
    const elapsedSeconds = Math.floor((now.getTime() - assignedAt.getTime()) / 1000);

    if (elapsedSeconds > dispatch.timeoutSeconds) {
      dispatch.status = DispatchStatus.TIMEOUT;
      await dispatch.save();
      throw new BadRequestException('派单已超时');
    }

    dispatch.status = DispatchStatus.ACCEPTED;
    dispatch.acceptedAt = new Date();
    await dispatch.save();

    // 更新司机状态为接单中
    await this.driverModel.findOneAndUpdate(
      { driverId: dispatch.driverId },
      { status: DriverStatus.ACCEPTING, currentOrderId: dispatch.orderId },
    );

    // TODO: 取消该订单的其他派单
    // await this.cancelOtherDispatches(dispatch.orderId, dispatchId);

    // TODO: 发送接单通知给用户
    // this.notificationService.sendAcceptNotification(dispatch.orderId, dispatch.driverId);

    return dispatch;
  }

  async rejectDispatch(dispatchId: string) {
    const dispatch = await this.getDispatch(dispatchId);

    if (dispatch.status !== DispatchStatus.DISPATCHED) {
      throw new BadRequestException('该派单状态不允许拒绝');
    }

    dispatch.status = DispatchStatus.REJECTED;
    dispatch.rejectedAt = new Date();
    await dispatch.save();

    return dispatch;
  }

  async deleteDispatch(dispatchId: string) {
    await this.dispatchModel.deleteOne({ dispatchId });
  }

  // ==================== 司机相关方法 ====================

  async createDriver(dto: any) {
    const driver = new this.driverModel({
      driverId: dto.driverId || uuidv4(),
      name: dto.name,
      phone: dto.phone,
      carType: dto.carType || CarType.NORMAL,
      carPlate: dto.carPlate,
      status: dto.status || DriverStatus.OFFLINE,
      rating: dto.rating || 0,
      totalTrips: dto.totalTrips || 0,
      isOnline: dto.isOnline || false,
    });

    return driver.save();
  }

  async getDriver(driverId: string) {
    const driver = await this.driverModel.findOne({ driverId });
    if (!driver) {
      throw new NotFoundException('司机不存在');
    }
    return driver;
  }

  async updateDriverStatus(driverId: string, dto: UpdateDriverStatusDto) {
    const driver = await this.getDriver(driverId);

    driver.status = dto.status;
    if (dto.isOnline !== undefined) {
      driver.isOnline = dto.isOnline;
    }

    await driver.save();
    return driver;
  }

  async updateDriverLocation(driverId: string, dto: UpdateDriverLocationDto) {
    const driver = await this.getDriver(driverId);

    const latitude = parseFloat(dto.latitude);
    const longitude = parseFloat(dto.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('无效的坐标');
    }

      driver.location = {
      type: 'Point',
      coordinates: [longitude as number, latitude as number], // MongoDB GeoJSON 使用 [lng, lat]
    };

    await driver.save();
    return driver;
  }

  async findNearbyDrivers(query: FindNearbyDriversDto) {
    const results = await this.findNearbyDriversInternal(query);
    return { drivers: results, count: results.length };
  }

  private async findNearbyDriversInternal(query: any) {
    const latitude = parseFloat(query.latitude);
    const longitude = parseFloat(query.longitude);
    const radius = query.radius || 5000; // 默认 5km

    if (isNaN(latitude) || isNaN(longitude)) {
      return [];
    }

    // @ts-ignore
    const filter: any = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius,
        },
      },
      isOnline: true,
    };

    if (query.carType) {
      filter.carType = parseInt(query.carType);
    }

    return this.driverModel.find(filter).limit(20);
  }

  async getAvailableDrivers(carType?: string) {
    const filter: any = {
      status: DriverStatus.IDLE,
      isOnline: true,
    };

    if (carType) {
      filter.carType = parseInt(carType);
    }

    const drivers = await this.driverModel.find(filter).limit(50);
    return { drivers, count: drivers.length };
  }

  async getDrivers(
    page: number,
    pageSize: number,
    status?: number,
    carType?: number,
  ) {
    const filter: any = {};
    if (status !== undefined) {
      filter.status = status;
    }
    if (carType !== undefined) {
      filter.carType = carType;
    }

    const skip = (page - 1) * pageSize;
    const [drivers, total] = await Promise.all([
      this.driverModel.find(filter).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
      this.driverModel.countDocuments(filter),
    ]);

    return {
      list: drivers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async deleteDriver(driverId: string) {
    await this.driverModel.deleteOne({ driverId });
  }
}
