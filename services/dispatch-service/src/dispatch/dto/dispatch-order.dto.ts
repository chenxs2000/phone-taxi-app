import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class DispatchOrderDto {
  @IsString()
  orderId: string;

  @IsString()
  @IsOptional()
  carType?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  maxDistance?: number;

  @IsNumber()
  @IsOptional()
  maxDrivers?: number;
}
