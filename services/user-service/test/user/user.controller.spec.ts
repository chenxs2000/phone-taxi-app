import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '../../src/app.module';

/**
 * 用户服务 API 测试
 * 对应测试用例: TC-USER-001 ~ TC-USER-015
 */
describe('UserController (e2e)', () => {
  let app: INestApplication;
  const mockVerifyCode = '123456';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot({
          uri: 'mongodb://localhost:27017/phone-taxi-app-test',
        }),
        ConfigModule.forRoot(),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * TC-USER-001: 用户注册
   */
  describe('POST /user/register', () => {
    it('应该成功注册新用户', () => {
      return request(app.getHttpServer())
        .post('/api/v1/user/register')
        .send({
          phone: '13812345678',
          verifyCode: mockVerifyCode,
          username: '测试用户',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toHaveProperty('userId');
          expect(res.body.data).toHaveProperty('token');
          expect(res.body.data).toHaveProperty('phone');
          // 验证手机号脱敏
          expect(res.body.data.phone).toMatch(/^\d{3}\*{4}\d{4}$/);
        });
    });

    it('应该拒绝缺失的手机号', () => {
      return request(app.getHttpServer())
        .post('/api/v1/user/register')
        .send({
          verifyCode: mockVerifyCode,
        })
        .expect(400);
    });

    it('应该拒绝缺失的验证码', () => {
      return request(app.getHttpServer())
        .post('/api/v1/user/register')
        .send({
          phone: '13812345678',
        })
        .expect(400);
    });
  });

  /**
   * TC-USER-002: 用户登录
   */
  describe('POST /user/login', () => {
    it('应该成功登录', () => {
      return request(app.getHttpServer())
        .post('/api/v1/user/login')
        .send({
          phone: '13812345679',
          verifyCode: mockVerifyCode,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.code).toBe(200);
          expect(res.body.data).toHaveProperty('token');
          expect(res.body.data).toHaveProperty('userId');
        });
    });

    it('应该拒绝无效的验证码', () => {
      return request(app.getHttpServer())
        .post('/api/v1/user/login')
        .send({
          phone: '13812345679',
          verifyCode: '999999',
        })
        .expect(400);
    });
  });

  /**
   * TC-USER-001/002: 发送验证码
   */
  describe('POST /user/send-verify-code', () => {
    it('应该成功发送验证码', () => {
      return request(app.getHttpServer())
        .post('/api/v1/user/send-verify-code')
        .send({ phone: '13812345680' })
        .expect(201)
        .expect((res) => {
          expect(res.body.code).toBe(200);
        });
    });

    it('应该拒绝空手机号', () => {
      return request(app.getHttpServer())
        .post('/api/v1/user/send-verify-code')
        .send({ phone: '' })
        .expect(400);
    });
  });

  /**
   * TC-USER-003: 获取用户信息
   */
  describe('GET /user/info', () => {
    it('应该成功返回用户信息', () => {
      // 需要先登录获取 token
      const loginResponse = request(app.getHttpServer())
        .post('/api/v1/user/login')
        .send({
          phone: '13812345681',
          verifyCode: mockVerifyCode,
        });

      // TODO: 使用返回的 token 请求用户信息
      // 目前跳过，需要先实现 JWT 认证中间件
    });
  });

  /**
   * TC-USER-005/006: 更新用户信息
   */
  describe('PUT /user/update', () => {
    it('应该成功更新用户信息', () => {
      // 需要认证 token
      const token = 'mock.jwt.token';

      return request(app.getHttpServer())
        .put('/api/v1/user/update')
        .set('Authorization', `Bearer ${token}`)
        .set('userId', '507f1f77bcf86cd79943911')
        .send({
          username: '新用户名',
          avatar: 'http://example.com/new-avatar.jpg',
        })
        .expect(200);
    });

    it('应该拒绝无认证的请求', () => {
      return request(app.getHttpServer())
        .put('/api/v1/user/update')
        .send({ username: '新用户名' })
        .expect(401);
    });
  });
});
