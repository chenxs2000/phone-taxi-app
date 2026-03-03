import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '身份证号', required: false })
  @IsOptional()
  @IsString()
  idCard?: string;
}
