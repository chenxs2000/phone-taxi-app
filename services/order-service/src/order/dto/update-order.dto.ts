import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, CarType } from '../../../../../shared/types';

export class UpdateOrderDto {
  @ApiProperty({ description: '上车信息', required: false })
  pickup?: {
    lat: number;
    lng: number;
    address: string;
    landmark?: string;
  };

  @ApiProperty({ description: '目的地信息', required: false })
  destination?: {
    lat: number;
    lng: number;
    address: string;
  };

  @ApiProperty({ description: '车型', required: false })
  @IsOptional()
  @IsEnum(CarType)
  carType?: CarType;

  @ApiProperty({ description: '乘客人数', required: false })
  @IsOptional()
  @IsNumber()
  passengerCount?: number;
}
