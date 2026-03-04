import { PrismaClient } from '@prisma/client';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Prisma 测试数据库
let prisma: PrismaClient;

// MongoDB 内存服务器
let mongoServer: MongoMemoryServer;

/**
 * 测试环境设置
 */
beforeAll(async () => {
  // 设置测试超时时间
  jest.setTimeout(30000);

  // 启动 MongoDB 内存服务器（用于订单服务）
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // 连接到测试数据库
  await mongoose.connect(mongoUri);

  // 设置环境变量
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongoUri;
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_EXPIRES_IN = '1d';

  console.log('集成测试环境已启动');
});

/**
 * 测试环境清理
 */
afterAll(async () => {
  // 断开数据库连接
  await mongoose.disconnect();

  // 停止 MongoDB 内存服务器
  if (mongoServer) {
    await mongoServer.stop();
  }

  // 关闭 Prisma 连接
  if (prisma) {
    await prisma.$disconnect();
  }

  console.log('集成测试环境已清理');
});

/**
 * 每个测试套件前的清理
 */
beforeEach(async () => {
  // 清理测试数据
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

/**
 * 工具函数 - 等待条件满足
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error(`条件在 ${timeout}ms 内未满足`);
}

/**
 * 工具函数 - 等待指定时间
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 工具函数 - 生成随机手机号
 */
export function generateRandomPhone(): string {
  const prefixes = ['138', '139', '150', '151', '152', '186', '187', '188', '189'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, '0');
  return `${prefix}${suffix}`;
}

/**
 * 工具函数 - 生成随机用户ID
 */
export function generateRandomUserId(): string {
  return `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * 工具函数 - 生成随机订单号
 */
export function generateRandomOrderNo(): string {
  return `TAXI${Date.now()}${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`;
}

/**
 * 工具函数 - 创建测试用户
 */
export async function createTestUser(phone?: string): Promise<any> {
  const testPhone = phone || generateRandomPhone();
  return {
    phone: testPhone,
    password: 'password123',
    name: '测试用户',
    userType: 1, // 乘客
  };
}

/**
 * 工具函数 - 创建测试订单
 */
export async function createTestOrder(userId?: string): Promise<any> {
  return {
    userId: userId || generateRandomUserId(),
    orderType: 1, // 即时订单
    carType: 1, // 普通车型
    pickup: {
      lat: 39.915,
      lng: 116.404,
      address: '北京市朝阳区',
    },
    destination: {
      lat: 40.015,
      lng: 116.504,
      address: '北京市海淀区',
    },
    passengerCount: 1,
  };
}

/**
 * 工具函数 - 获取访问令牌
 */
export async function getAccessToken(
  baseUrl: string,
  phone: string,
  password: string
): Promise<string> {
  const response = await fetch(`${baseUrl}/api/v1/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password, userType: 1 }),
  });

  const data = await response.json();
  return data.data.accessToken;
}

/**
 * 工具函数 - 创建认证请求头
 */
export function createAuthHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}
