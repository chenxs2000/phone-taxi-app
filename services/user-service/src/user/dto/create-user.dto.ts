import { IsString, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: '手机号', example: '13812345678' })
  @IsString()
  phone: string;

  @ApiProperty({ description: '验证码', example: '123456' })
  @IsString()
  verifyCode: string;

  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '性别: 0-未知 1-男 2-女', required: false })
  @IsOptional()
  @IsEnum([0, 1, 2])
  gender?: number;

  @ApiProperty({ description: '生日', required: false })
  @IsOptional()
  @IsString()
  birthday?: string;

  @ApiProperty({ description: '注册渠道', required: false })
  @IsOptional()
  @IsString()
  registerChannel?: string;
}
