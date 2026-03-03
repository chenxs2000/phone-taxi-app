import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../../src/user/user.service';
import { User, UserDocument } from '../../src/user/entities/user.entity';
import { CreateUserDto } from '../../src/user/dto/create-user.dto';
import { LoginDto } from '../../src/user/dto/login.dto';
import { UserStatus } from '../../src/user/entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let userModel: any;

  // 对应测试用例: TC-USER-001 ~ TC-USER-015

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({ secret: 'test-secret' }),
        MongooseModule.forRoot({
          uri: 'mongodb://localhost:27017/phone-taxi-app-test',
        }),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User.name));
  });

  afterEach(async () => {
    // 清理测试数据
    await userModel.deleteMany({});
  });

  describe('用户注册 (TC-USER-001)', () => {
    it('应该成功注册新用户', async () => {
      const createDto: CreateUserDto = {
        phone: '13812345678',
        verifyCode: '123456',
        username: '测试用户',
      };

      // 注意：这需要 mock Redis 的验证码验证
      const result = await service.register(createDto);

      expect(result.code).toBe(200);
      expect(result.data).toHaveProperty('userId');
      expect(result.data).toHaveProperty('token');
    });

    it('应该拒绝已注册的手机号', async () => {
      const createDto: CreateUserDto = {
        phone: '13812345678',
        verifyCode: '123456',
      };

      // 先创建一个用户
      await userModel.create({
        phone: '13812345678',
        status: UserStatus.NORMAL,
      });

      // 尝试再次注册
      await expect(service.register(createDto)).rejects.toThrow();
    });

    it('应该验证码错误时拒绝', async () => {
      const createDto: CreateUserDto = {
        phone: '13812345678',
        verifyCode: '999999', // 错误的验证码
      };

      await expect(service.register(createDto)).rejects.toThrow();
    });

    it('应该自动标记60岁以上的用户为老年人', async () => {
      const createDto: CreateUserDto = {
        phone: '13812345679',
        verifyCode: '123456',
        birthday: '1960-01-01', // 60岁以上
      };

      const result = await service.register(createDto);

      expect(result.data.isElderly).toBe(true);
    });
  });

  describe('用户登录 (TC-USER-002)', () => {
    it('应该成功登录已注册用户', async () => {
      // 先创建用户
      await userModel.create({
        phone: '13812345680',
        username: '测试用户',
        status: UserStatus.NORMAL,
      });

      const loginDto: LoginDto = {
        phone: '13812345680',
        verifyCode: '123456',
      };

      const result = await service.login(loginDto);

      expect(result.code).toBe(200);
      expect(result.data).toHaveProperty('token');
      expect(result.data).toHaveProperty('userId');
    });

    it('应该拒绝不存在的用户', async () => {
      const loginDto: LoginDto = {
        phone: '13888888888',
        verifyCode: '123456',
      };

      await expect(service.login(loginDto)).rejects.toThrow();
    });

    it('应该拒绝已禁用的用户', async () => {
      // 先创建禁用用户
      await userModel.create({
        phone: '13812345681',
        username: '禁用用户',
        status: UserStatus.DISABLED,
      });

      const loginDto: LoginDto = {
        phone: '13812345681',
        verifyCode: '123456',
      };

      await expect(service.login(loginDto)).rejects.toThrow();
    });

    it('应该验证码错误时拒绝', async () => {
      const loginDto: LoginDto = {
        phone: '13812345680',
        verifyCode: '999999',
      };

      await expect(service.login(loginDto)).rejects.toThrow();
    });
  });

  describe('获取用户信息 (TC-USER-003)', () => {
    it('应该成功返回用户信息', async () => {
      // 创建测试用户
      const user = await userModel.create({
        phone: '13812345682',
        username: '测试用户',
        avatar: 'http://example.com/avatar.jpg',
        gender: 1,
        status: UserStatus.NORMAL,
      });

      const result = await service.getUserInfo(user._id.toString());

      expect(result.code).toBe(200);
      expect(result.data.phone).toContain('****'); // 手机号应脱敏
      expect(result.data.userId).toBe(user._id.toString());
    });

    it('应该拒绝不存在的用户ID', async () => {
      const fakeId = '507f1f77bcf86cd79943911';

      await expect(service.getUserInfo(fakeId)).rejects.toThrow();
    });
  });

  describe('更新用户信息 (TC-USER-005, TC-USER-006)', () => {
    it('应该成功更新用户名和头像', async () => {
      const user = await userModel.create({
        phone: '13812345683',
        username: '旧用户名',
        status: UserStatus.NORMAL,
      });

      const result = await service.updateUser(user._id.toString(), {
        username: '新用户名',
        avatar: 'http://example.com/new-avatar.jpg',
      });

      expect(result.code).toBe(200);
    });

    it('应该拒绝不存在的用户ID', async () => {
      const fakeId = '507f1f77bcf86cd79943912';

      await expect(service.updateUser(fakeId, { username: '新用户名' })).rejects.toThrow();
    });
  });

  describe('发送验证码', () => {
    it('应该成功发送验证码', async () => {
      const result = await service.sendVerifyCode('13812345684');

      expect(result.code).toBe(200);
      expect(result.message).toContain('发送');
    });
  });

  describe('更新订单统计', () => {
    it('应该成功更新用户订单数和消费金额', async () => {
      const user = await userModel.create({
        phone: '13812345685',
        totalOrders: 5,
        totalAmount: 150,
        status: UserStatus.NORMAL,
      });

      await service.updateOrderStats(user._id.toString(), 50);

      const updatedUser = await userModel.findById(user._id).exec();
      expect(updatedUser.totalOrders).toBe(6);
      expect(updatedUser.totalAmount).toBe(200);
    });
  });
});
