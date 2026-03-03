# 集成测试文档

## 概述

本目录包含 Phone Taxi App 的跨服务集成测试，验证多个微服务之间的交互和数据流转。

## 测试场景

### TC-INT-001: 用户注册流程
- 发送验证码
- 注册新用户
- 验证用户信息

### TC-INT-002: 用户登录流程
- 使用手机号和密码登录
- 获取访问令牌
- 验证令牌有效性

### TC-INT-003: 创建订单流程
- 创建即时订单
- 获取订单详情
- 获取用户订单列表
- 验证订单状态和数据

### TC-INT-004: 订单状态流转
- 待派单 -> 待接单
- 待接单 -> 已接单
- 已接单 -> 已到达
- 已到达 -> 进行中

### TC-INT-005: 支付流程
- 计算订单费用
- 创建支付订单
- 完成支付
- 验证支付状态

### TC-INT-006: 订单完成
- 完成订单
- 评价订单
- 验证完成状态和评价数据

### TC-INT-007: 订单取消
- 取消待派单订单
- 验证取消状态和退款金额

### TC-INT-008: 错误处理
- 未授权请求
- 无效的订单ID
- 无效的订单数据

## 运行测试

### 前置条件

1. 确保所有微服务正在运行：
   ```bash
   # 在各服务目录下运行
   npm run start:dev
   ```

2. 或者使用 Docker Compose 启动所有服务：
   ```bash
   docker-compose up -d
   ```

### 运行所有集成测试

```bash
# 从项目根目录
npm run test:integration
```

### 运行单个测试文件

```bash
npm test tests/integration/complete-booking-flow.spec.ts
```

### 运行特定测试场景

```bash
npm test -- --testNamePattern="用户注册流程"
```

## 环境变量

确保在 `.env` 文件中配置了以下变量：

```env
# 用户服务
USER_SERVICE_URL=http://localhost:3001

# 订单服务
ORDER_SERVICE_URL=http://localhost:3002

# 派单服务
DISPATCH_SERVICE_URL=http://localhost:3003

# 支付服务
PAYMENT_SERVICE_URL=http://localhost:3004

# 通知服务
NOTIFICATION_SERVICE_URL=http://localhost:3005

# 统计服务
STATISTICS_SERVICE_URL=http://localhost:3006

# API 网关
API_GATEWAY_URL=http://localhost:3000

# JWT 密钥
JWT_SECRET=phone-taxi-app-secret-key

# 数据库连接
MONGODB_URI=mongodb://localhost:27017/phone-taxi-test

# Redis 连接
REDIS_URI=redis://localhost:6379

# RabbitMQ 连接
RABBITMQ_URI=amqp://guest:guest@localhost:5672
```

## 测试数据

集成测试使用以下测试数据：

- 测试用户手机号: 13800138000
- 测试用户密码: password123
- 测试用户ID: user-123
- 测试司机ID: driver-123
- 测试支付人ID: payer-123
- 测试验证码: 123456 (仅限测试环境)

## 清理测试数据

测试完成后，可以运行清理脚本删除测试数据：

```bash
npm run test:cleanup
```

## 故障排除

### 问题: 服务连接失败

**解决方案**: 确保所有微服务正在运行且端口正确

```bash
# 检查服务状态
curl http://localhost:3001/api/health
curl http://localhost:3002/api/health
curl http://localhost:3003/api/health
curl http://localhost:3004/api/health
```

### 问题: 数据库连接失败

**解决方案**: 确保 MongoDB 正在运行

```bash
# 启动 MongoDB
docker-compose up -d mongodb

# 或检查 MongoDB 状态
curl http://localhost:27017
```

### 问题: 测试超时

**解决方案**: 增加测试超时时间或检查服务响应速度

```javascript
// 在测试文件中增加超时
jest.setTimeout(30000); // 30秒
```

## 持续集成

集成测试会在以下情况下自动运行：

- Pull Request 提交
- 主分支合并
- 定时执行（每日凌晨）

## 贡献

添加新的集成测试时，请遵循以下规则：

1. 使用 `TC-INT-XXX` 命名约定
2. 每个测试场景应该独立可运行
3. 使用 beforeEach/afterEach 清理测试数据
4. 添加详细的注释和文档
5. 测试成功和失败路径

## 许可证

Copyright © 2026 Phone Taxi App. All rights reserved.
