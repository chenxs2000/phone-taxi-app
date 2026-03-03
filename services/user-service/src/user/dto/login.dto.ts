import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '手机号', example: '13812345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: '验证码', example: '123456' })
  @IsString()
  @IsNotEmpty()
  verifyCode: string;
}
