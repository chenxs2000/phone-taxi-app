# CI/CD 监控指南

## 📊 监控 CI/CD 首次执行

### 🎯 访问 GitHub Actions 页面

**Actions 页面链接**：
```
https://github.com/chenxs2000/phone-taxi-app/actions
```

---

## 📋 预期的 CI/CD 工作流

### 工作流名称：`Phone Taxi App CI/CD`

**触发条件**：
- Push 到 `main` 或 `develop` 分支
- Push 到 `test-ci-cd` 分支（当前分支）

**执行阶段**（按顺序）：

#### 阶段 1: 代码质量检查
- **作业**: Lint and Format
- **执行内容**:
  - ESLint 代码检查
  - Prettier 代码格式检查
  - 代码质量扫描
- **预计时间**: 2-3 分钟
- **成功标准**: ✅ 无阻塞错误，警告可以接受

---

#### 阶段 2: 单元测试
- **作业**: Unit Tests
- **执行平台**:
  - Ubuntu 18.x
  - Ubuntu 20.x
  - Windows 18.x
  - Windows 20.x
  - macOS 18.x
  - macOS 20.x
- **测试覆盖**: 所有 8 个微服务
- **预计时间**: 5-8 分钟
- **成功标准**: ✅ 所有测试通过，覆盖率 > 70%

---

#### 阶段 3: 集成测试
- **作业**: Integration Tests
- **执行内容**:
  - 启动 MongoDB、Redis、RabbitMQ
  - 运行集成测试套件
  - 验证服务间通信
- **预计时间**: 8-12 分钟
- **成功标准**: ✅ 所有集成测试通过

---

#### 阶段 4: 构建
- **作业**: Build Services
- **执行内容**:
  - User Service 构建
  - Order Service 构建
  - Dispatch Service 构建
  - Payment Service 构建
  - Notification Service 构建
  - Statistics Service 构建
  - Call Service 构建
  - API Gateway 构建
- **预计时间**: 10-15 分钟
- **成功标准**: ✅ 所有服务构建成功，无编译错误

---

#### 阶段 5: Docker 镜像构建
- **作业**: Build Docker Images
- **执行内容**:
  - 多平台镜像构建（linux/amd64, linux/arm64）
  - 镜像优化
  - 镜像标签管理
- **预计时间**: 15-20 分钟
- **成功标准**: ✅ 所有镜像构建成功

---

#### 阶段 6: Docker 镜像推送
- **作业**: Push Docker Images
- **执行内容**:
  - 登录 GitHub Container Registry
  - 推送所有镜像
  - 验证镜像可用性
- **预计时间**: 10-15 分钟
- **成功标准**: ✅ 所有镜像推送成功

---

#### 阶段 7: 部署到测试环境
- **作业**: Deploy to Staging
- **执行内容**:
  - 更新测试环境配置
  - 部署所有服务
  - 健康检查
- **预计时间**: 5-10 分钟
- **成功标准**: ✅ 所有服务部署成功，健康检查通过

---

#### 阶段 8: 部署到生产环境
- **作业**: Deploy to Production
- **执行内容**:
  - 更新生产环境配置
  - 部署所有服务
  - 健康检查
  - 验证可用性
- **预计时间**: 5-10 分钟
- **成功标准**: ✅ 所有服务部署成功，生产环境可用

---

#### 阶段 9: 性能测试
- **作业**: Performance Tests
- **执行内容**:
  - Artillery 负载测试
  - 响应时间测试
  - 并发测试
- **预计时间**: 5-8 分钟
- **成功标准**: ✅ 性能指标达标，无明显性能问题

---

## 🔍 如何查看执行日志

### 查看工作流运行

1. 访问 Actions 页面
2. 找到最近的运行记录（绿色✅或红色✗）
3. 点击运行记录查看详情

### 查看单个作业日志

1. 在工作流运行页面
2. 点击要查看的作业（如 "Unit Tests"）
3. 展开查看详细日志

### 下载日志

1. 在作业页面右上角
2. 点击 "Download log archive"
3. 下载 ZIP 文件进行离线分析

---

## ⏱️ 预期时间线

| 时间 | 阶段 | 状态 |
|------|------|------|
| 0-3 分钟 | 代码质量检查 | ⏳ 运行中 |
| 3-11 分钟 | 单元测试 | ⏳ 运行中 |
| 11-23 分钟 | 集成测试 | ⏳ 运行中 |
| 23-38 分钟 | 构建 | ⏳ 运行中 |
| 38-58 分钟 | Docker 镜像构建 | ⏳ 运行中 |
| 58-73 分钟 | Docker 镜像推送 | ⏳ 运行中 |
| 73-83 分钟 | 部署到测试环境 | ⏳ 运行中 |
| 83-93 分钟 | 部署到生产环境 | ⏳ 运行中 |
| 93-101 分钟 | 性能测试 | ⏳ 运行中 |
| 总计 | 约 100 分钟 | ⏳ 完成 |

---

## 🚨 常见问题和解决方案

### 问题 1: 代码质量检查失败

**症状**: ESLint 报告错误

**解决方案**:
```bash
# 本地运行 ESLint 检查
npm run lint

# 自动修复可修复的问题
npm run lint -- --fix
```

---

### 问题 2: 单元测试失败

**症状**: 某些测试失败

**解决方案**:
```bash
# 本地运行测试
npm test

# 查看详细错误信息
npm test -- --verbose

# 查看覆盖率
npm test -- --coverage
```

---

### 问题 3: 集成测试失败

**症状**: 数据库连接失败

**解决方案**:
- 检查 MongoDB/Redis/RabbitMQ 是否已启动
- 检查环境变量配置
- 查看服务日志

---

### 问题 4: 构建失败

**症状**: TypeScript 编译错误

**解决方案**:
```bash
# 本地构建
npm run build

# 检查 TypeScript 错误
npm run build -- --verbose
```

---

### 问题 5: Docker 镜像构建失败

**症状**: Dockerfile 语法错误

**解决方案**:
```bash
# 本地构建镜像
docker build -t test-image .

# 查看详细错误
docker build -t test-image . --progress=plain
```

---

### 问题 6: 镜像推送失败

**症状**: 认证失败

**解决方案**:
1. 检查 DOCKER_USERNAME 和 DOCKER_PASSWORD 是否正确
2. 验证 Token 权限是否包含 `write:packages`
3. 检查 GitHub Container Registry 是否可用

---

### 问题 7: 部署失败

**症状**: 健康检查失败

**解决方案**:
1. 检查环境配置文件
2. 验证服务端口是否可用
3. 查看服务启动日志

---

## ✅ 成功标准

### 最小成功要求

- ✅ 代码质量检查通过（无阻塞错误）
- ✅ 单元测试通过（至少 70% 覆盖率）
- ✅ 构建成功（无编译错误）
- ✅ Docker 镜像构建成功

### 理想成功标准

- ✅ 所有 9 个阶段全部成功
- ✅ 测试覆盖率 > 80%
- ✅ 集成测试全部通过
- ✅ 测试环境部署成功
- ✅ 性能测试指标达标

---

## 📊 执行后验证

### 1. 检查工作流状态

访问 Actions 页面，查看所有作业状态：
```
https://github.com/chenxs2000/phone-taxi-app/actions
```

### 2. 检查 Docker 镜像

访问 Container Registry：
```
https://github.com/chenxs2000?tab=packages
```

应该看到以下镜像：
- phone-taxi/user-service
- phone-taxi/order-service
- phone-taxi/dispatch-service
- phone-taxi/payment-service
- phone-taxi/notification-service
- phone-taxi/statistics-service
- phone-taxi/call-service
- phone-taxi/api-gateway

### 3. 检查测试环境

如果部署到测试环境成功：
- 访问健康检查端点
- 验证服务响应
- 检查日志

---

## 📝 监控清单

### 首次执行监控

- [ ] 访问 GitHub Actions 页面
- [ ] 确认工作流已触发
- [ ] 监控代码质量检查阶段
- [ ] 监控单元测试阶段
- [ ] 监控集成测试阶段
- [ ] 监控构建阶段
- [ ] 监控 Docker 镜像构建阶段
- [ ] 监控 Docker 镜像推送阶段
- [ ] 监控部署阶段
- [ ] 监控性能测试阶段
- [ ] 记录失败或警告
- [ ] 下载执行日志（如果需要）

---

## 🎯 下一步行动

### 如果全部成功

1. 查看执行报告
2. 记录执行时间
3. 准备生产环境配置
4. 设置监控和告警

### 如果部分失败

1. 记录失败阶段
2. 查看详细日志
3. 本地重现问题
4. 修复问题
5. 重新推送代码

---

**文档版本**: 1.0.0
**创建时间**: 2026-03-03
