import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';

// 临时解决方案：在本地定义 successResponse
function successResponse(data: any, message?: string) {
  return {
    success: true,
    data,
    message: message || '操作成功',
  };
}

@ApiTags('用户管理')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 用户注册
   * 对应测试用例: TC-USER-001
   */
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 200, description: '注册成功' })
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.userService.register(createUserDto);
  }

  /**
   * 用户登录
   * 对应测试用例: TC-USER-002
   */
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  async login(@Body() loginDto: LoginDto) {
    return await this.userService.login(loginDto);
  }

  /**
   * 发送验证码
   */
  @Post('send-verify-code')
  @ApiOperation({ summary: '发送验证码' })
  @ApiResponse({ status: 200, description: '验证码已发送' })
  async sendVerifyCode(@Body('phone') phone: string) {
    if (!phone) {
      return successResponse(null, '手机号不能为空');
    }
    return await this.userService.sendVerifyCode(phone);
  }

  /**
   * 获取用户信息
   * 对应测试用例: TC-USER-003
   * 需要认证
   */
  @Get('info')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户信息' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getUserInfo(@Body('userId') userId: string) {
    return await this.userService.getUserInfo(userId);
  }

  /**
   * 更新用户信息
   * 对应测试用例: TC-USER-005, TC-USER-006
   * 需要认证
   */
  @Put('update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateUser(@Body('userId') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateUser(userId, updateUserDto);
  }
}
