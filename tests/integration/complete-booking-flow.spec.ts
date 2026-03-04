import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../services/user-service/src/app.module';
import { AppModule as OrderModule } from '../../services/order-service/src/app.module';
import { AppModule as DispatchModule } from '../../services/dispatch-service/src/app.module';
import { AppModule as PaymentModule } from '../../services/payment-service/src/app.module';

/**
 * 集成测试 - 完整的订单流程
 *
 * 测试场景：
 * 1. 用户注册并登录
 * 2. 创建订单
 * 3. 订单派单
 * 4. 支付流程
 * 5. 订单完成
 */
describe('Complete Booking Flow Integration Tests', () => {
  let app: INestApplication;
  let userAccessToken: string;
  let orderId: string;

  beforeAll(async () => {
    // 创建测试应用
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * 测试场景 1: 用户注册流程
   */
  describe('用户注册流程 (TC-INT-001)', () => {
    it('应该成功发送验证码', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/user/send-verify-code')
        .send({
          phone: '13800138000',
          type: 'register',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('验证码已发送');
    });

    it('应该成功注册新用户', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/user/register')
        .send({
          phone: '13800138000',
          verifyCode: '123456', // 测试环境使用固定验证码
          password: 'password123',
          name: '测试用户',
          userType: 1, // 乘客
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.phone).toBe('13800138000');
    });
  });

  /**
   * 测试场景 2: 用户登录流程
   */
  describe('用户登录流程 (TC-INT-002)', () => {
    it('应该成功登录并获取访问令牌', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/user/login')
        .send({
          phone: '13800138000',
          password: 'password123',
          userType: 1,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.userId).toBeDefined();

      // 保存访问令牌供后续测试使用
      userAccessToken = response.body.data.accessToken;
    });
  });

  /**
   * 测试场景 3: 创建订单流程
   */
  describe('创建订单流程 (TC-INT-003)', () => {
    it('应该成功创建即时订单', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/order/create')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          userId: 'user-123', // 测试用户ID
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
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBeDefined();
      expect(response.body.data.orderNo).toBeDefined();
      expect(response.body.data.status).toBe(1); // PENDING_DISPATCH

      // 保存订单ID供后续测试使用
      orderId = response.body.data.orderId;
    });

    it('应该能够获取订单详情', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/order/${orderId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBe(orderId);
      expect(response.body.data.status).toBe(1);
      expect(response.body.data.pickup).toBeDefined();
      expect(response.body.data.destination).toBeDefined();
    });

    it('应该能够获取用户的订单列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/order/user/orders')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({
          userId: 'user-123',
          page: 1,
          pageSize: 10,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.list).toBeDefined();
      expect(Array.isArray(response.body.data.list)).toBe(true);
      expect(response.body.data.total).toBeGreaterThan(0);
    });
  });

  /**
   * 测试场景 4: 订单状态流转
   */
  describe('订单状态流转 (TC-INT-004)', () => {
    it('应该能够更新订单状态为待接单', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/order/${orderId}/status`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          status: 2, // PENDING_ACCEPT
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(2);
    });

    it('应该能够更新订单状态为已接单', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/order/${orderId}/status`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          status: 3, // ACCEPTED
          driverId: 'driver-123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(3);
      expect(response.body.data.driverId).toBe('driver-123');
    });

    it('应该能够更新订单状态为已到达', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/order/${orderId}/status`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          status: 4, // ARRIVED
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(4);
    });

    it('应该能够更新订单状态为进行中', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/order/${orderId}/status`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          status: 5, // IN_PROGRESS
          startTime: new Date(),
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(5);
    });
  });

  /**
   * 测试场景 5: 支付流程
   */
  describe('支付流程 (TC-INT-005)', () => {
    it('应该能够计算订单费用', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/payment/${orderId}/calculate`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          distance: 5000, // 5公里
          duration: 600, // 10分钟
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fare).toBeDefined();
      expect(response.body.data.fare).toBeGreaterThan(0);
    });

    it('应该能够创建支付订单', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/payment/create`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          orderId,
          paymentType: 2, // 代付
          amount: 25, // 预估费用
          payerId: 'payer-123', // 代付人ID
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentId).toBeDefined();
      expect(response.body.data.orderId).toBe(orderId);
    });

    it('应该能够完成支付', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/payment/${orderId}/pay`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          paymentMethod: 1, // 现金
          transactionId: 'TXN123456789',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(1); // PAID
    });
  });

  /**
   * 测试场景 6: 订单完成
   */
  describe('订单完成 (TC-INT-006)', () => {
    it('应该能够完成订单', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/order/${orderId}/status`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          status: 6, // COMPLETED
          endTime: new Date(),
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(6);
    });

    it('应该能够评价订单', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/order/${orderId}/rate`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          rating: 5,
          comment: '司机服务很好',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.comment).toBe('司机服务很好');
    });
  });

  /**
   * 测试场景 7: 订单取消
   */
  describe('订单取消 (TC-INT-007)', () => {
    it('应该能够取消待派单订单', async () => {
      // 创建新订单用于取消测试
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/order/create')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          userId: 'user-123',
          orderType: 1,
          carType: 1,
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
        });

      const newOrderId = createResponse.body.data.orderId;

      // 取消订单
      const response = await request(app.getHttpServer())
        .post(`/api/v1/order/${newOrderId}/cancel`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          reason: '用户取消',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(8); // CANCELLED
      expect(response.body.data.refundAmount).toBeDefined();
    });
  });

  /**
   * 测试场景 8: 错误处理
   */
  describe('错误处理 (TC-INT-008)', () => {
    it('应该拒绝未授权的请求', async () => {
      await request(app.getHttpServer()).get('/api/v1/order/orders').expect(401);
    });

    it('应该拒绝无效的订单ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/order/invalid-order-id')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('订单不存在');
    });

    it('应该拒绝无效的订单数据', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/order/create')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          // 缺少必要字段
        })
        .expect(200);

      expect(response.body.success).toBe(false);
    });
  });
});
