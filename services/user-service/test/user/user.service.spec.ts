import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../../src/user/user.service';
import { CreateUserDto } from '../../src/user/dto/create-user.dto';
import { LoginDto } from '../../src/user/dto/login.dto';
import { UserStatus } from '../../src/user/entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let mockUserModel: any;

  // 对应测试用例: TC-USER-001 ~ TC-USER-015
  // Mock 数据库
  const mockUsers = new Map<string, any>();
  let userIdCounter = 1;

  const generateUserId = () => `user-${userIdCounter++}`;

  beforeEach(() => {
    mockUsers.clear();
    userIdCounter = 1;
  });

  beforeEach(async () => {
    // Mock userModel
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      deleteMany: jest.fn(),
      exec: jest.fn(),
      toObject: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('用户注册 (TC-USER-001)', () => {
    it.skip('应该成功注册新用户 (需要 Redis 实现)', async () => {
      const createDto: CreateUserDto = {
        phone: '13812345678',
        verifyCode: '123456',
        username: '测试用户',
      };

      // Mock 不存在用户
      mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      // Mock 创建用户
      const mockUser = {
        _id: generateUserId(),
        phone: createDto.phone,
        username: createDto.username,
        status: UserStatus.NORMAL,
        totalOrders: 0,
        totalAmount: 0,
        isElderly: false,
        toObject: jest.fn().mockReturnValue({
          _id: generateUserId(),
          phone: createDto.phone,
          username: createDto.username,
          status: UserStatus.NORMAL,
          totalOrders: 0,
          totalAmount: 0,
          isElderly: false,
        }),
      };
      mockUserModel.create.mockResolvedValue(mockUser);

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

      // Mock 存在用户
      const existingUser = {
        phone: createDto.phone,
        status: UserStatus.NORMAL,
      };
      mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingUser) });

      await expect(service.register(createDto)).rejects.toThrow();
    });

    it('应该验证码错误时拒绝', async () => {
      const createDto: CreateUserDto = {
        phone: '13812345678',
        verifyCode: '999999', // 错误的验证码
      };

      // Mock 不存在用户
      mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.register(createDto)).rejects.toThrow();
    });

    it.skip('应该自动标记60岁以上的用户为老年人 (需要 Redis 实现)', async () => {
      const createDto: CreateUserDto = {
        phone: '13812345679',
        verifyCode: '123456',
        birthday: '1960-01-01', // 60岁以上
        username: '老年用户',
      };

      // Mock 不存在用户
      mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      // Mock 创建用户
      const mockUser = {
        _id: generateUserId(),
        phone: createDto.phone,
        username: createDto.username,
        birthday: createDto.birthday,
        status: UserStatus.NORMAL,
        totalOrders: 0,
        totalAmount: 0,
        isElderly: true,
        toObject: jest.fn().mockReturnValue({
          _id: generateUserId(),
          phone: createDto.phone,
          username: createDto.username,
          birthday: createDto.birthday,
          status: UserStatus.NORMAL,
          totalOrders: 0,
          totalAmount: 0,
          isElderly: true,
        }),
      };
      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.register(createDto);

      expect(result.data.isElderly).toBe(true);
    });
  });

  describe('用户登录 (TC-USER-002)', () => {
    it.skip('应该成功登录已注册用户 (需要 Redis 实现)', async () => {
      const mockUser = {
        _id: generateUserId(),
        phone: '13812345680',
        username: '测试用户',
        status: UserStatus.NORMAL,
        isElderly: false,
        isVip: false,
        vipLevel: 0,
        vipExpireTime: null,
        lastOrderTime: new Date(),
        toObject: jest.fn().mockReturnValue({
          _id: generateUserId(),
          phone: '13812345680',
          username: '测试用户',
          status: UserStatus.NORMAL,
          isElderly: false,
          isVip: false,
          vipLevel: 0,
          vipExpireTime: null,
          lastOrderTime: new Date(),
        }),
      };

      mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      mockUserModel.save.mockResolvedValue(mockUser);

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

      mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.login(loginDto)).rejects.toThrow();
    });

    it('应该拒绝已禁用的用户', async () => {
      const disabledUser = {
        _id: generateUserId(),
        phone: '13812345681',
        username: '禁用用户',
        status: UserStatus.DISABLED,
        toObject: jest.fn().mockReturnValue({
          _id: generateUserId(),
          phone: '13812345681',
          username: '禁用用户',
          status: UserStatus.DISABLED,
        }),
      };

      mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(disabledUser) });

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

      mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.login(loginDto)).rejects.toThrow();
    });
  });

  describe('获取用户信息 (TC-USER-003)', () => {
    it('应该成功返回用户信息', async () => {
      const userId = generateUserId();
      const mockUser = {
        _id: userId,
        phone: '13812345682',
        username: '测试用户',
        avatar: 'http://example.com/avatar.jpg',
        gender: 1,
        status: UserStatus.NORMAL,
        isElderly: false,
        isVip: false,
        vipLevel: 0,
        vipExpireTime: null,
        totalOrders: 5,
        totalAmount: 150,
        lastOrderTime: new Date(),
        tags: [],
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          phone: '13812345682',
          username: '测试用户',
          avatar: 'http://example.com/avatar.jpg',
          gender: 1,
          status: UserStatus.NORMAL,
          isElderly: false,
          isVip: false,
          vipLevel: 0,
          vipExpireTime: null,
          totalOrders: 5,
          totalAmount: 150,
          lastOrderTime: new Date(),
          tags: [],
        }),
      };

      mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

      const result = await service.getUserInfo(userId);

      expect(result.code).toBe(200);
      expect(result.data.userId).toBe(userId);
    });

    it('应该拒绝不存在的用户ID', async () => {
      const fakeId = '507f1f77bcf86cd79943911';

      mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.getUserInfo(fakeId)).rejects.toThrow();
    });
  });

  describe('更新用户信息 (TC-USER-005, TC-USER-006)', () => {
    it('应该成功更新用户名和头像', async () => {
      const userId = generateUserId();
      const mockUser = {
        _id: userId,
        phone: '13812345683',
        username: '旧用户名',
        avatar: 'http://example.com/old-avatar.jpg',
        status: UserStatus.NORMAL,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          phone: '13812345683',
          username: '新用户名',
          avatar: 'http://example.com/new-avatar.jpg',
          status: UserStatus.NORMAL,
        }),
      };

      mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

      const result = await service.updateUser(userId, {
        username: '新用户名',
        avatar: 'http://example.com/new-avatar.jpg',
      });

      expect(result.code).toBe(200);
      expect(result.data.username).toBe('新用户名');
      expect(result.data.avatar).toBe('http://example.com/new-avatar.jpg');
    });

    it('应该拒绝不存在的用户ID', async () => {
      const fakeId = '507f1f77bcf86cd79943912';

      mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.updateUser(fakeId, { username: '新用户名' })).rejects.toThrow();
    });
  });

  describe('发送验证码', () => {
    it('应该成功发送验证码', async () => {
      const result = await service.sendVerifyCode('13812345684');

      expect(result.code).toBe(200);
      expect(result.data).toHaveProperty('code');
    });
  });

  describe('更新订单统计', () => {
    it('应该成功更新用户订单数和消费金额', async () => {
      const userId = generateUserId();
      const orderAmount = 50;

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      });

      await service.updateOrderStats(userId, orderAmount);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, expect.objectContaining({
        $inc: expect.any(Object),
        lastOrderTime: expect.any(Date),
      }));
    });
  });
});
