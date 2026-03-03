const request = require('supertest');

/**
 * API Gateway 简单集成测试
 *
 * 测试 API Gateway 基本功能
 */
describe('API Gateway Simple Integration Tests', () => {
  const API_BASE_URL = process.env.API_GATEWAY_URL || 'http://localhost:3001/api';

  beforeAll(() => {
    console.log('API Gateway URL:', API_BASE_URL);
    console.log('开始集成测试...');
  });

  /**
   * 测试场景 1: 基础连接性
   */
  describe('基础连接性 (TC-INT-SIMPLE-001)', () => {
    it('应该能够连接到 API Gateway', async () => {
      const response = await request(`${API_BASE_URL}/health`)
        .get('')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.code).toBe(200);
    });

    it('应该返回健康状态', async () => {
      const response = await request(`${API_BASE_URL}/health`)
        .get('')
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.services).toBeInstanceOf(Array);
      expect(response.body.data.services.length).toBeGreaterThan(0);
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
  describe('根路径端点 (TC-INT-SIMPLE-002)', () => {
    it('应该返回欢迎消息', async () => {
      const response = await request(`${API_BASE_URL}`)
        .get('')
        .expect(200);

      expect(response.body.message).toBe('欢迎使用 Phone Taxi API');
      expect(response.body.version).toBe('1.0.0');
    });

    it('应该列出所有端点', async () => {
      const response = await request(`${API_BASE_URL}`)
        .get('')
        .expect(200);

      expect(response.body.endpoints).toBeDefined();
      expect(response.body.endpoints.health).toBe('/health');
      expect(response.body.endpoints.user).toBe('/api/v1/user/*');
    });
  });

  /**
   * 测试场景 3: 服务配置
   */
  describe('服务配置 (TC-INT-SIMPLE-003)', () => {
    it('应该配置了所有微服务', async () => {
      const response = await request(`${API_BASE_URL}/health`)
        .get('')
        .expect(200);

      const services = response.body.data.services;
      expect(services).toContain('userService');
      expect(services).toContain('orderService');
      expect(services).toContain('dispatchService');
      expect(services).toContain('paymentService');
      expect(services).toContain('notificationService');
      expect(services).toContain('statisticsService');
    });
  });

  /**
   * 测试场景 4: 响应格式
   */
  describe('响应格式 (TC-INT-SIMPLE-004)', () => {
    it('应该返回 JSON 格式', async () => {
      const response = await request(`${API_BASE_URL}/health`)
        .get('')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('应该包含时间戳', async () => {
      const response = await request(`${API_BASE_URL}/health`)
        .get('')
        .expect(200);

      expect(response.body.timestamp).toBeDefined();
      expect(response.body.timestamp).toBeGreaterThan(0);
    });

    it('应该包含成功的响应代码', async () => {
      const response = await request(`${API_BASE_URL}/health`)
        .get('')
        .expect(200);

      expect(response.body.code).toBe(200);
      expect(response.body.message).toBeDefined();
    });
  });

  /**
   * 测试场景 5: 错误处理
   */
  describe('错误处理 (TC-INT-SIMPLE-005)', () => {
    it('应该返回404用于不存在的路由', async () => {
      const response = await request(`${API_BASE_URL}/nonexistent`)
        .get('');

      expect(response.status).toBe(404);
    });

    it('应该返回401用于未认证请求或404用于不存在的路由', async () => {
      // 测试需要认证的端点，可能返回401或404
      const response = await request(`${API_BASE_URL}/v1/order/orders`)
        .get('');

      // 根据网关配置，可能返回401（未认证）或404（路由不存在）
      expect([401, 404]).toContain(response.status);
    });
  });

  /**
   * 测试场景 6: 响应时间
   */
  describe('性能测试 (TC-INT-SIMPLE-006)', () => {
    it('健康检查应在合理时间内响应', async () => {
      const start = Date.now();
      const response = await request(`${API_BASE_URL}/health`)
        .get('')
        .expect(200);
      const end = Date.now();
      const duration = end - start;

      expect(duration).toBeLessThan(1000); // 应该在1秒内响应
      console.log(`  健康检查响应时间: ${duration}ms`);
    });

    it('根路径应在合理时间内响应', async () => {
      const start = Date.now();
      const response = await request(`${API_BASE_URL}`)
        .get('')
        .expect(200);
      const end = Date.now();
      const duration = end - start;

      expect(duration).toBeLessThan(1000);
      console.log(`  根路径响应时间: ${duration}ms`);
    });
  });
});
