# 电话打车应用 (Phone Taxi Booking System)

一个基于电话叫车的完整网约车系统，为不使用智能手机的用户群体提供便捷的叫车服务。

## 系统架构

```
                    ┌─────────────┐
                    │   前端应用   │
                    │  (待开发)    │
                    │ 司机|家属|坐席 │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  API Gateway │
                    │    :3000     │
                    └──────┬──────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
┌───▼────┐        ┌──────▼──────┐        ┌──────▼──────┐
│  User  │        │   Order     │        │  Dispatch   │
│:3001   │        │  :3002      │        │   :3003     │
└────────┘        └─────────────┘        └─────────────┘

┌───▼────┐        ┌──────▼──────┐        ┌──────▼──────┐
│Payment │        │Notification │        │ Statistics  │
│:3004   │        │   :3005      │        │   :3006     │
└────────┘        └─────────────┘        └─────────────┘

                  ┌──────▼──────┐
                  │    Call     │
                  │   :3007     │
                  └─────────────┘

基础设施层:
- MongoDB (:27017)
- Redis (:6379)
- RabbitMQ (:5672, :15672)
```

## 技术栈

### 后端
- **框架**: NestJS 10+ / Node.js 20+
- **数据库**: MongoDB 7+
- **缓存**: Redis 7+
- **消息队列**: RabbitMQ 3.12+
- **服务注册**: Nacos 2.3+
- **API网关**: NestJS Gateway
- **认证**: JWT + Passport

### 前端
- **移动端**: React Native 0.74+
- **Web端**: React 18+ / Ant Design 5+
- **状态管理**: Zustand

### 基础设施
- **容器化**: Docker + Docker Compose
- **编排**: Kubernetes
- **CI/CD**: GitHub Actions
- **监控**: Prometheus + Grafana

## 目录结构

```
phone-taxi-app/
├── services/                    # 微服务
│   ├── call-service/           # 呼叫服务
│   ├── order-service/          # 订单服务
│   ├── dispatch-service/       # 派单服务
│   ├── payment-service/        # 支付服务
│   ├── user-service/          # 用户服务
│   ├── notification-service/   # 通知服务
│   └── statistics-service/    # 统计服务
├── apps/                       # 应用端
│   ├── driver-app/            # 司机APP
│   ├── family-app/            # 家属端APP
│   └── agent-web/            # 坐席系统
├── infrastructure/              # 基础设施
│   ├── api-gateway/           # API网关
│   ├── docker/                # Docker配置
│   ├── k8s/                  # Kubernetes配置
│   └── ci-cd/                # CI/CD配置
├── shared/                     # 共享代码
│   ├── types/                 # TypeScript类型
│   ├── constants/             # 常量定义
│   ├── utils/                 # 工具函数
│   └── dto/                   # 数据传输对象
├── docs/                       # 文档
└── tests/                      # 集成测试
```

## 服务列表

| 服务名称 | 端口 | 描述 | 状态 |
|---------|------|------|------|
| API Gateway | 3000 | API 网关 | ✅ |
| User Service | 3001 | 用户服务 | ✅ |
| Order Service | 3002 | 订单服务 | ✅ |
| Dispatch Service | 3003 | 派单服务 | ✅ |
| Payment Service | 3004 | 支付服务 | ✅ |
| Notification Service | 3005 | 通知服务 | ✅ |
| Statistics Service | 3006 | 统计服务 | ✅ |
| Call Service | 3007 | 呼叫服务 | ✅ |

## 快速开始

### 环境要求
- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker & Docker Compose
- MongoDB >= 7.0
- Redis >= 7.0
- RabbitMQ >= 3.12

### 使用 Docker Compose 启动

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f [service-name]

# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

### 本地开发

```bash
# 进入各服务目录
cd services/user-service
npm install
npm run start:dev

# ... 其他服务同样方式启动
```

### 安装依赖
```bash
npm install
```

### 启动基础设施（Docker）
```bash
npm run docker:up
```

### 启动开发环境
```bash
# 启动所有服务
npm run dev

# 启动特定服务
cd services/user-service
npm run start:dev
```

### 运行测试
```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 代码检查
```bash
# ESLint 检查
npm run lint

# 自动修复
npm run lint:fix

# Prettier 格式化
npm run format
```

## API 文档

### API Gateway (http://localhost:3000)
- `GET /health` - 健康检查
- `POST /api/users/*` - 用户相关
- `POST /api/orders/*` - 订单相关
- `POST /api/dispatch/*` - 派单相关
- `POST /api/payments/*` - 支付相关
- `POST /api/notifications/*` - 通知相关
- `GET /api/statistics/*` - 统计相关
- `POST /api/calls/*` - 呼叫相关

### 各服务健康检查
- User Service: http://localhost:3001/user/health
- Order Service: http://localhost:3002/order/health
- Dispatch Service: http://localhost:3003/dispatch/health
- Payment Service: http://localhost:3004/payment/health
- Notification Service: http://localhost:3005/notification/health
- Statistics Service: http://localhost:3006/statistics/health
- Call Service: http://localhost:3007/call/health

### API 文档 (待实现)
- Swagger UI: http://localhost:3000/api/docs

## 项目进度

### 后端服务 ✅
- [x] 用户服务 (User Service) - 用户注册、登录、信息管理
- [x] 订单服务 (Order Service) - 订单创建、状态管理
- [x] 派单服务 (Dispatch Service) - 司机派单、位置管理
- [x] 支付服务 (Payment Service) - 支付处理、退款管理
- [x] 通知服务 (Notification Service) - 消息推送、通知管理
- [x] 统计服务 (Statistics Service) - 数据统计、报表生成
- [x] 呼叫服务 (Call Service) - 电话呼叫、录音管理
- [x] API 网关 (API Gateway) - 请求路由、负载均衡

### 前端应用 ⏳
- [ ] 司机端 App (React Native)
- [ ] 家属端 App (React Native)
- [ ] 坐席系统 (React Web)

### DevOps
- [x] Docker 配置
- [x] Docker Compose 编排
- [ ] GitHub Actions CI/CD 配置
- [ ] Kubernetes 部署配置
- [ ] 集成测试
- [ ] 性能测试

## 开发规范

### 提交规范
遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

### 分支策略
- `main`: 生产分支
- `develop`: 开发分支
- `feature/*`: 功能分支
- `bugfix/*`: 修复分支

## 测试覆盖率要求
- 单元测试覆盖率 ≥ 80%
- 关键路径 100% 覆盖
- 所有 P0 测试用例必须通过

## 许可证

MIT
