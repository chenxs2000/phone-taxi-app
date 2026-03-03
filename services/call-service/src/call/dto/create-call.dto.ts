import { IsString, IsEnum, IsOptional } from 'class-validator';
import { CallType } from '../entities/call.entity';

export class CreateCallDto {
  @IsEnum(CallType)
  type: CallType;

  @IsString()
  callerNumber: string;

  @IsString()
  calleeNumber: string;

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
