import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderDto {
  @ApiProperty({ description: '取消原因', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
