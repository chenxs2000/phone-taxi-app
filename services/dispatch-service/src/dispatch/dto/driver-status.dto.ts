import { IsString, IsEnum, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { DriverStatus } from '../entities/driver.entity';

export class UpdateDriverStatusDto {
  @IsString()
  driverId: string;

  @IsEnum(DriverStatus)
  status: DriverStatus;

  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;
}

export class UpdateDriverLocationDto {
  @IsString()
  driverId: string;

  @IsString()
  latitude: string;

  @IsString()
  longitude: string;
}

export class FindNearbyDriversDto {
  @IsString()
  latitude: string;

  @IsString()
  longitude: string;

  @IsString()
  @IsOptional()
  carType?: string;

  @IsNumber()
  @IsOptional()
  radius?: number;
}
