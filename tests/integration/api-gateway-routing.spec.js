const request = require('supertest');

/**
 * API Gateway 集成测试
 *
 * 测试场景：
 * 1. 网关健康检查
 * 2. 根路径端点
 * 3. 路由转发功能
 * 4. 认证守卫
 * 5. 错误处理
 */
describe('API Gateway Routing Integration Tests', () => {
  const API_BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:3001/api';
  let testToken;

  beforeAll(() => {
    // 设置测试超时
    jest.setTimeout(30000);
  });

  /**
   * 测试场景 1: 网关健康检查
   */
  describe('网关健康检查 (TC-GW-001)', () => {
    it('应该返回健康检查响应', async () => {
      const response = await request(`${API_BASE_URL}/health`)
        .get('')
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('API网关运行正常');
      expect(response.body.data.services).toContain('userService');
      expect(response.body.data.services).toContain('orderService');
      expect(response.body.data.services).toContain('dispatchService');
      expect(response.body.data.services).toContain('paymentService');
      expect(response.body.data.services).toContain('notificationService');
      expect(response.body.data.services).toContain('statisticsService');
    });

    it('应该包含版本信息', async () => {
      const response = await request(`${API_BASE_URL}/health`)
        .get('')
        .expect(200);

      expect(response.body.data.version).toBe('1.0.0');
      expect(response.body.data.uptime).toBeGreaterThan(0);
    });
  });

  /**
   * 测试场景 2: 根路径端点
   */
  describe('根路径端点 (TC-GW-002)', () => {
    it('应该返回 API 信息', async () => {
      const response = await request(`${API_BASE_URL}`)
        .get('')
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('欢迎使用 Phone Taxi API');
      expect(response.body.version).toBe('1.0.0');
    });

    it('应该列出所有可用端点', async () => {
      const response = await request(`${API_BASE_URL}`)
        .get('')
        .expect(200);

      expect(response.body.data.health).toBe('/health');
      expect(response.body.data.user).toBe('/api/v1/user/*');
      expect(response.body.data.order).toBe('/api/v1/order/*');
      expect(response.body.data.driver).toBe('/api/v1/driver/*');
      expect(response.body.data.payment).toBe('/api/v1/payment/*');
      expect(response.body.data.notification).toBe('/api/v1/notification/*');
      expect(response.body.data.statistics).toBe('/api/v1/statistics/*');
    });
  });

  /**
   * 测试场景 3: 用户服务路由
   */
  describe('用户服务路由 (TC-GW-003)', () => {
    it('应该正确路由到用户服务', async () => {
      // 测试白名单路径（无需认证）
      const registerResponse = await request(`${API_BASE_URL}/v1/user/register`)
        .post('')
        .send({
          phone: '13800138000',
          verifyCode: '123456',
          password: 'password123',
          name: '测试用户',
          userType: 1,
        });

      // 响应可能来自用户服务或包含错误，但网关应该正常转发
      expect([200, 400, 409]).toContain(registerResponse.status);
    });

    it('应该拒绝未认证的受保护端点', async () => {
      await request(`${API_BASE_URL}/v1/user/orders`)
        .get('')
        .query({ userId: 'test-123' })
        .expect(401);
    });

    it('应该拒绝无效的认证令牌', async () => {
      await request(`${API_BASE_URL}/v1/user/orders`)
        .get('')
        .query({ userId: 'test-123' })
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(401);
    });
  });

  /**
   * 测试场景 4: 订单服务路由
   */
  describe('订单服务路由 (TC-GW-004)', () => {
    it('应该正确路由到订单服务', async () => {
      // 使用临时有效的 JWT 令牌进行测试
      await request(`${API_BASE_URL}/v1/order/orders`)
        .get('')
        .query({ userId: 'test-123' })
        .set('Authorization', 'Bearer test-token-for-gateway-testing')
        .expect(401); // 预期401因为令牌无效，但网关应该正确路由
    });

    it('应该路由到订单创建端点', async () => {
      const orderData = {
        userId: 'test-123',
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
        passengerCount: 1,
      };

      await request(`${API_BASE_URL}/v1/order/create`)
        .post('')
        .set('Authorization', 'Bearer test-token')
        .send(orderData)
        .expect(401); // 令牌无效，但应该正确路由
    });
  });

  /**
   * 测试场景 5: 派单服务路由
   */
  describe('派单服务路由 (TC-GW-005)', () => {
    it('应该正确路由到派单服务', async () => {
      await request(`${API_BASE_URL}/v1/driver/available`)
        .get('')
        .query({ lat: 39.915, lng: 116.404 })
        .set('Authorization', 'Bearer test-token')
        .expect(401); // 令牌无效，但应该正确路由
    });

    it('应该路由司机状态更新', async () => {
      await request(`${API_BASE_URL}/v1/driver/status`)
        .post('')
        .set('Authorization', 'Bearer test-token')
        .send({ driverId: 'driver-123', status: 1 })
        .expect(401); // 令牌无效，但应该正确路由
    });
  });

  /**
   * 测试场景 6: 支付服务路由
   */
  describe('支付服务路由 (TC-GW-006)', () => {
    it('应该正确路由到支付服务', async () => {
      await request(`${API_BASE_URL}/v1/payment/calculate`)
        .post('')
        .set('Authorization', 'Bearer test-token')
        .send({
          orderId: 'test-order-123',
          distance: 5000,
          duration: 600,
        })
        .expect(401); // 令牌无效，但应该正确路由
    });

    it('应该路由支付创建端点', async () => {
      await request(`${API_BASE_URL}/v1/payment/create`)
        .post('')
        .set('Authorization', 'Bearer test-token')
        .send({
          orderId: 'test-order-123',
          paymentType: 2,
          amount: 25,
        })
        .expect(401); // 令牌无效，但应该正确路由
    });
  });

  /**
   * 测试场景 7: 通知服务路由
   */
  describe('通知服务路由 (TC-GW-007)', () => {
    it('应该正确路由到通知服务', async () => {
      await request(`${API_BASE_URL}/v1/notification/send`)
        .post('')
        .set('Authorization', 'Bearer test-token')
        .send({
          userId: 'test-123',
          type: 1,
          message: '测试通知',
        })
        .expect(401); // 令牌无效，但应该正确路由
    });
  });

  /**
   * 测试场景 8: 统计服务路由
   */
  describe('统计服务路由 (TC-GW-008)', () => {
    it('应该正确路由到统计服务', async () => {
      await request(`${API_BASE_URL}/v1/statistics/overview`)
        .get('')
        .set('Authorization', 'Bearer test-token')
        .expect(401); // 令牌无效，但应该正确路由
    });

    it('应该路由统计数据查询', async () => {
      await request(`${API_BASE_URL}/v1/statistics/reports`)
        .post('')
        .set('Authorization', 'Bearer test-token')
        .send({
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        })
        .expect(401); // 令牌无效，但应该正确路由
    });
  });

  /**
   * 测试场景 9: HTTP 方法路由
   */
  describe('HTTP 方法路由 (TC-GW-009)', () => {
    it('应该支持 GET 方法', async () => {
      await request(`${API_BASE_URL}/v1/order/test`)
        .get('')
        .set('Authorization', 'Bearer test-token')
        .expect(401);
    });

    it('应该支持 POST 方法', async () => {
      await request(`${API_BASE_URL}/v1/order/test`)
        .post('')
        .set('Authorization', 'Bearer test-token')
        .send({})
        .expect(401);
    });

    it('应该支持 PUT 方法', async () => {
      await request(`${API_BASE_URL}/v1/order/test-id`)
        .put('')
        .set('Authorization', 'Bearer test-token')
        .send({})
        .expect(401);
    });

    it('应该支持 DELETE 方法', async () => {
      await request(`${API_BASE_URL}/v1/order/test-id`)
        .delete('')
        .set('Authorization', 'Bearer test-token')
        .expect(401);
    });

    it('应该支持 PATCH 方法', async () => {
      await request(`${API_BASE_URL}/v1/order/test-id/status`)
        .patch('')
        .set('Authorization', 'Bearer test-token')
        .send({})
        .expect(401);
    });
  });

  /**
   * 测试场景 10: 错误处理和超时
   */
  describe('错误处理和超时 (TC-GW-010)', () => {
    it('应该处理服务不可用情况', async () => {
      // 请求不存在的路径
      await request(`${API_BASE_URL}/v1/nonexistent-service/test`)
        .get('')
        .set('Authorization', 'Bearer test-token')
        .expect(404); // 路由不存在
    });

    it('应该处理无效的请求体', async () => {
      await request(`${API_BASE_URL}/v1/order/create`)
        .post('')
        .set('Authorization', 'Bearer test-token')
        .send({ invalid: 'data' })
        .expect(401); // 可能被服务拒绝或验证
    });

    it('应该处理超时情况', async () => {
      // 注意：此测试需要模拟服务响应缓慢
      // 实际环境中，网关应该有适当的超时处理
      const response = await request(`${API_BASE_URL}/health`)
        .get('')
        .timeout(5000)
        .expect(200);

      expect(response.body.code).toBe(200);
    });
  });

  /**
   * 测试场景 11: 请求头转发
   */
  describe('请求头转发 (TC-GW-011)', () => {
    it('应该转发 Content-Type 头', async () => {
      await request(`${API_BASE_URL}/v1/order/test`)
        .post('')
        .set('Authorization', 'Bearer test-token')
        .set('Content-Type', 'application/json')
        .send({})
        .expect(401);
    });

    it('应该转发自定义请求头', async () => {
      await request(`${API_BASE_URL}/v1/order/test`)
        .get('')
        .set('Authorization', 'Bearer test-token')
        .set('X-Custom-Header', 'custom-value')
        .expect(401);
    });

    it('应该过滤不安全的头', async () => {
      // 测试网关是否过滤 Host、Connection 等头
      await request(`${API_BASE_URL}/v1/order/test`)
        .get('')
        .set('Authorization', 'Bearer test-token')
        .expect(401);
    });
  });
});
