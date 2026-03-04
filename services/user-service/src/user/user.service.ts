import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import {
  generateVerifyCode,
  maskPhone,
  successResponse,
  errorResponse,
} from '../../../shared/utils';
import { ERROR_CODES, REDIS, MESSAGES } from '../../../shared/constants';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * 用户注册
   * 对应测试用例: TC-USER-001
   */
  async register(createUserDto: CreateUserDto) {
    const { phone, verifyCode } = createUserDto;

    // 1. 验证验证码
    const storedCode = await this.getVerifyCode(phone);
    if (!storedCode || storedCode !== verifyCode) {
      throw new BadRequestException(errorResponse(ERROR_CODES.INVALID_PARAMS, '验证码错误'));
    }

    // 2. 检查手机号是否已注册
    const existingUser = await this.userModel.findOne({ phone }).exec();
    if (existingUser) {
      throw new ConflictException(errorResponse(ERROR_CODES.INVALID_PARAMS, '手机号已注册'));
    }

    // 3. 创建用户
    const newUser = new this.userModel({
      phone,
      username: createUserDto.username || phone.substring(7),
      avatar: createUserDto.avatar,
      gender: createUserDto.gender,
      birthday: createUserDto.birthday ? new Date(createUserDto.birthday) : undefined,
      registerChannel: createUserDto.registerChannel,
      registerSource: createUserDto.registerSource,
      status: UserStatus.NORMAL,
      totalOrders: 0,
      totalAmount: 0,
      isElderly: this.checkIsElderly(createUserDto.birthday),
    });

    await newUser.save();

    // 4. 清除验证码
    await this.deleteVerifyCode(phone);

    // 5. 返回用户信息（脱敏手机号）
    const userObj = newUser.toObject();
    return successResponse({
      userId: userObj._id.toString(),
      phone: maskPhone(userObj.phone),
      token: this.generateToken(userObj._id.toString()),
    });
  }

  /**
   * 用户登录
   * 对应测试用例: TC-USER-002
   */
  async login(loginDto: LoginDto) {
    const { phone, verifyCode } = loginDto;

    // 1. 验证验证码
    const storedCode = await this.getVerifyCode(phone);
    if (!storedCode || storedCode !== verifyCode) {
      throw new BadRequestException(errorResponse(ERROR_CODES.INVALID_PARAMS, '验证码错误'));
    }

    // 2. 查找用户
    const user = await this.userModel.findOne({ phone }).exec();
    if (!user) {
      throw new NotFoundException(errorResponse(ERROR_CODES.USER_NOT_FOUND, '用户不存在'));
    }

    // 3. 检查用户状态
    if (user.status === UserStatus.DISABLED) {
      throw new BadRequestException(errorResponse(ERROR_CODES.USER_DISABLED, '用户已被禁用'));
    }

    // 4. 更新最后登录时间
    user.lastOrderTime = new Date();
    await user.save();

    // 5. 清除验证码
    await this.deleteVerifyCode(phone);

    // 6. 返回登录信息
    const userObj = user.toObject();
    return successResponse({
      userId: userObj._id.toString(),
      phone: maskPhone(userObj.phone),
      username: userObj.username,
      avatar: userObj.avatar,
      isElderly: userObj.isElderly,
      isVip: userObj.isVip,
      vipLevel: userObj.vipLevel,
      vipExpireTime: userObj.vipExpireTime,
      token: this.generateToken(userObj._id.toString()),
    });
  }

  /**
   * 获取用户信息
   * 对应测试用例: TC-USER-003
   */
  async getUserInfo(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(errorResponse(ERROR_CODES.USER_NOT_FOUND, '用户不存在'));
    }

    const userObj = user.toObject();
    return successResponse({
      userId: userObj._id.toString(),
      phone: maskPhone(userObj.phone),
      username: userObj.username,
      avatar: userObj.avatar,
      gender: userObj.gender,
      birthday: userObj.birthday,
      isElderly: userObj.isElderly,
      isVip: userObj.isVip,
      vipLevel: userObj.vipLevel,
      vipExpireTime: userObj.vipExpireTime,
      status: userObj.status,
      totalOrders: userObj.totalOrders,
      totalAmount: userObj.totalAmount,
      lastOrderTime: userObj.lastOrderTime,
      tags: userObj.tags,
    });
  }

  /**
   * 更新用户信息
   * 对应测试用例: TC-USER-005, TC-USER-006
   */
  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(errorResponse(ERROR_CODES.USER_NOT_FOUND, '用户不存在'));
    }

    // 更新允许修改的字段
    if (updateUserDto.username !== undefined) {
      user.username = updateUserDto.username;
    }
    if (updateUserDto.avatar !== undefined) {
      user.avatar = updateUserDto.avatar;
    }
    if (updateUserDto.idCard !== undefined) {
      user.idCard = this.encryptIdCard(updateUserDto.idCard);
    }

    await user.save();

    const userObj = user.toObject();
    return successResponse({
      userId: userObj._id.toString(),
      phone: maskPhone(userObj.phone),
      username: userObj.username,
      avatar: userObj.avatar,
    });
  }

  /**
   * 发送验证码
   * 对应测试用例: TC-USER-001, TC-USER-002
   */
  async sendVerifyCode(phone: string) {
    const code = generateVerifyCode();
    // TODO: 调用短信服务发送验证码
    console.log(`发送验证码到 ${phone}: ${code}`);

    // 将验证码存储到 Redis（这里使用模拟实现）
    await this.saveVerifyCode(phone, code);
    return successResponse({ code: '验证码已发送' });
  }

  /**
   * 检查是否为老年人（年龄≥60岁）
   */
  private checkIsElderly(birthday?: string): boolean {
    if (!birthday) return false;
    const birthDate = new Date(birthday);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 60;
  }

  /**
   * 生成 JWT Token
   */
  private generateToken(userId: string): string {
    const jwt = require('jsonwebtoken') as any;
    const secret = process.env.JWT_SECRET || 'phone-taxi-app-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign({ userId }, secret, { expiresIn });
  }

  /**
   * 加密身份证号
   */
  private encryptIdCard(idCard: string): string {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ID_CARD_KEY || '16-byte-key', 'utf8');
    const iv = Buffer.from('16-byte-iv', 'utf8');

    const cipher = crypto.createCipher(algorithm, key);
    cipher.update(idCard, 'utf8', 'hex');
    return cipher.final('hex');
  }

  /**
   * 保存验证码到 Redis
   * 模拟实现，实际应使用 Redis
   */
  private async saveVerifyCode(phone: string, code: string): Promise<void> {
    // TODO: 实际应使用 Redis 存储
    // await this.redis.set(`${REDIS.PREFIX}verify:${phone}`, code, 'EX', REDIS.TTL.VERIFICATION_CODE);
    console.log(`存储验证码: ${phone} -> ${code}`);
  }

  /**
   * 获取验证码
   */
  private async getVerifyCode(phone: string): Promise<string | null> {
    // TODO: 实际应从 Redis 获取
    // return await this.redis.get(`${REDIS.PREFIX}verify:${phone}`);
    return null; // 模拟实现
  }

  /**
   * 删除验证码
   */
  private async deleteVerifyCode(phone: string): Promise<void> {
    // TODO: 实际应删除 Redis 中的验证码
    // await this.redis.del(`${REDIS.PREFIX}verify:${phone}`);
    console.log(`删除验证码: ${phone}`);
  }

  /**
   * 更新用户订单统计
   */
  async updateOrderStats(userId: string, orderAmount: number): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: {
        totalOrders: 1,
        totalAmount: orderAmount,
      },
      lastOrderTime: new Date(),
    });
  }
}
