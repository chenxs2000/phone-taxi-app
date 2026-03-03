import { IsString, IsEnum, IsNumber } from 'class-validator';
import { DispatchStatus } from '../entities/dispatch.entity';

export class CreateDispatchDto {
  @IsString()
  orderId: string;

  @IsString()
  driverId: string;

  @IsEnum(DispatchStatus)
  @IsNumber()
  status: DispatchStatus;

  @IsNumber()
  timeoutSeconds?: number;
}
