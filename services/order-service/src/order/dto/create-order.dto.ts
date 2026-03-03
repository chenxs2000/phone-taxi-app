import { IsNumber, IsString, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderType, CarType } from '../../../../../shared/types';

export class CreateOrderDto {
  @ApiProperty({ description: '用户ID', example: '507f1f77bcf86cd79943911' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '订单类型: 1-即时 2-预约 3-紧急' })
  @IsEnum(OrderType)
  @IsOptional()
  orderType?: OrderType;

  @ApiProperty({ description: '车型: 1-普通 2-舒适 3-无障碍' })
  @IsEnum(CarType)
  @IsOptional()
  carType?: CarType;

  @ApiProperty({ description: '乘客人数', example: 1 })
  @IsNumber()
  @Min(1)
  @Max(4)
  passengerCount: number = 1;

  @ApiProperty({ description: '上车信息' })
  pickup: {
    lat: number;
    lng: number;
    address: string;
    landmark?: string;
  };

  @ApiProperty({ description: '目的地信息' })
  destination: {
    lat: number;
    lng: number;
    address: string;
  };

  @ApiProperty({ description: '预约用车时间', required: false })
  @IsOptional()
  @IsString()
  bookingTime?: string;
}
