# CI/CD 实时监控清单

## 🔍 监控步骤

### 1️⃣ 访问 GitHub Actions 页面

```
https://github.com/chenxs2000/phone-taxi-app/actions
```

**您应该看到**：
- ✅ 一个工作流运行记录
- 状态：运行中（黄色图标 🔄）或已完成（绿色 ✅ / 红色 ✗）

---

### 2️⃣ 点击查看工作流详情

点击最新的运行记录，查看各个作业的执行状态。

---

## 📋 预期的 9 个阶段

### 阶段 1: Lint and Format
- **预计时间**: 2-3 分钟
- **检查内容**:
  - ESLint 代码检查
  - Prettier 代码格式
- **成功标志**: ✅ 绿色勾号
- **失败原因**:
  - 代码风格不符合规范
  - ESLint 错误

**日志位置**: 点击 "Lint and Format" 作业查看详细日志

---

### 阶段 2: Unit Tests
- **预计时间**: 5-8 分钟
- **测试平台**: 6 个（Ubuntu 18.x, Ubuntu 20.x, Windows 18.x, Windows 20.x, macOS 18.x, macOS 20.x）
- **测试内容**:
  - 所有微服务的单元测试
  - 测试覆盖率检查
- **成功标志**: ✅ 所有 6 个平台都显示绿色勾号
- **失败原因**:
  - 某些测试失败
  - 依赖安装问题
  - Node.js 版本兼容问题

**日志位置**: 点击 "Unit Tests" 作业，展开各个平台的日志

---

### 阶段 3: Integration Tests
- **预计时间**: 8-12 分钟
- **测试内容**:
  - MongoDB 连接测试
  - Redis 缓存测试
  - RabbitMQ 消息队列测试
  - 跨服务通信测试
- **成功标志**: ✅ 绿色勾号
- **失败原因**:
  - 数据库连接失败
  - 服务启动超时
  - 端口冲突

**日志位置**: 点击 "Integration Tests" 作业查看详细日志

---

### 阶段 4: Build Services
- **预计时间**: 10-15 分钟
- **构建内容**: 8 个服务
  1. User Service
  2. Order Service
  3. Dispatch Service
  4. Payment Service
  5. Notification Service
  6. Statistics Service
  7. Call Service
  8. API Gateway
- **成功标志**: ✅ 所有 8 个服务都显示绿色勾号
- **失败原因**:
  - TypeScript 编译错误
  - 依赖安装失败
  - 资源不足

**日志位置**: 点击 "Build Services" 作业，展开各个服务的构建日志

---

### 阶段 5: Build Docker Images
- **预计时间**: 15-20 分钟
- **构建内容**: 8 个 Docker 镜像
- **平台**: linux/amd64, linux/arm64
- **成功标志**: ✅ 所有镜像都显示绿色勾号
- **失败原因**:
  - Dockerfile 语法错误
  - 镜像构建超时
  - 磁盘空间不足

**日志位置**: 点击 "Build Docker Images" 作业查看详细日志

---

### 阶段 6: Push Docker Images
- **预计时间**: 10-15 分钟
- **推送内容**: 8 个镜像到 GitHub Container Registry
- **成功标志**: ✅ 所有镜像都推送成功
- **失败原因**:
  - 认证失败（DOCKER_USERNAME 或 DOCKER_PASSWORD 错误）
  - 权限不足
  - 网络问题

**日志位置**: 点击 "Push Docker Images" 作业查看详细日志

---

### 阶段 7: Deploy to Staging
- **预计时间**: 5-10 分钟
- **部署内容**: 部署到测试环境
- **成功标志**: ✅ 绿色勾号
- **失败原因**:
  - 测试环境未准备好
  - 配置文件错误
  - 健康检查失败

**日志位置**: 点击 "Deploy to Staging" 作业查看详细日志

---

### 阶段 8: Deploy to Production
- **预计时间**: 5-10 分钟
- **部署内容**: 部署到生产环境（仅 main 分支）
- **注意**: test-ci-cd 分支可能不会触发此阶段
- **成功标志**: ✅ 绿色勾号（如果执行）
- **失败原因**:
  - 生产环境未准备好
  - 安全检查失败
  - 部署权限不足

**日志位置**: 点击 "Deploy to Production" 作业查看详细日志

---

### 阶段 9: Performance Tests
- **预计时间**: 5-8 分钟
- **测试内容**: Artillery 负载测试
- **成功标志**: ✅ 绿色勾号
- **失败原因**:
  - 响应时间超出阈值
  - 并发处理能力不足
  - 错误率过高

**日志位置**: 点击 "Performance Tests" 作业查看详细日志

---

## ⏱️ 预期时间线

| 时间 | 阶段 | 状态 |
|------|------|------|
| 0-3 分钟 | Lint and Format | ⏳ 运行中 |
| 3-11 分钟 | Unit Tests | ⏳ 运行中 |
| 11-23 分钟 | Integration Tests | ⏳ 运行中 |
| 23-38 分钟 | Build Services | ⏳ 运行中 |
| 38-58 分钟 | Build Docker Images | ⏳ 运行中 |
| 58-73 分钟 | Push Docker Images | ⏳ 运行中 |
| 73-83 分钟 | Deploy to Staging | ⏳ 运行中 |
| 83-93 分钟 | Deploy to Production | ⏳ 运行中 |
| 93-101 分钟 | Performance Tests | ⏳ 运行中 |
| **总计** | **约 100 分钟** | ⏳ |

---

## 🚨 常见问题排查

### 问题 1: 工作流未触发

**症状**: Actions 页面没有运行记录

**解决方案**:
1. 检查工作流文件路径：`.github/workflows/ci-cd.yml`
2. 检查分支保护设置
3. 重新推送代码：
   ```bash
   git commit --allow-empty -m "Trigger CI/CD"
   git push origin test-ci-cd
   ```

---

### 问题 2: Lint 失败

**症状**: ESLint 报告错误

**本地验证**:
```bash
cd C:/Users/chenx/phone-taxi-app
npm run lint
```

**解决方案**:
```bash
npm run lint -- --fix
```

---

### 问题 3: 单元测试失败

**症状**: 某些测试失败

**本地验证**:
```bash
cd C:/Users/chenx/phone-taxi-app/services/user-service
npm test
```

**解决方案**:
查看失败测试的详细信息，修复代码后重新推送。

---

### 问题 4: 镜像推送失败

**症状**: Push Docker Images 阶段失败

**检查项**:
1. Secrets 是否配置：
   - DOCKER_USERNAME: `chenxs2000`
   - DOCKER_PASSWORD: 是否正确

2. Token 权限：
   - 是否包含 `write:packages`？

**解决方案**:
1. 访问：https://github.com/chenxs2000/phone-taxi-app/settings/secrets/actions
2. 验证 Secrets 配置
3. 如需更新，删除并重新创建

---

### 问题 5: 部署失败

**症状**: Deploy to Staging 阶段失败

**检查项**:
1. 测试环境是否已准备好
2. 端口是否可用
3. 配置文件是否正确

**解决方案**:
1. 检查环境配置
2. 手动启动服务验证
3. 查看部署日志

---

## ✅ 成功标准

### 最小成功（第一阶段目标）

- ✅ 代码质量检查通过
- ✅ 单元测试通过（至少 70% 覆盖率）
- ✅ 构建成功
- ✅ Docker 镜像构建成功

### 理想成功（最终目标）

- ✅ 所有 9 个阶段全部成功
- ✅ 测试覆盖率 > 80%
- ✅ 集成测试全部通过
- ✅ 镜像成功推送到 GitHub Container Registry
- ✅ 测试环境部署成功
- ✅ 性能测试指标达标

---

## 📝 监控检查清单

### 实时监控

- [ ] 访问 GitHub Actions 页面
- [ ] 确认工作流已触发
- [ ] 监控 Lint 阶段（0-3 分钟）
- [ ] 监控 Unit Tests 阶段（3-11 分钟）
- [ ] 监控 Integration Tests 阶段（11-23 分钟）
- [ ] 监控 Build 阶段（23-38 分钟）
- [ ] 监控 Docker Build 阶段（38-58 分钟）
- [ ] 监控 Docker Push 阶段（58-73 分钟）
- [ ] 监控 Deploy to Staging 阶段（73-83 分钟）
- [ ] 监控 Deploy to Production 阶段（83-93 分钟）
- [ ] 监控 Performance Tests 阶段（93-101 分钟）

### 执行后验证

- [ ] 查看最终状态
- [ ] 记录成功/失败的阶段
- [ ] 下载执行日志（如果需要）
- [ ] 查看 Docker 镜像是否已推送
- [ ] 检查测试环境状态（如果部署成功）

---

## 🎯 下一步行动

### 如果全部成功

1. ✅ 标记任务 #45 为完成
2. 📊 创建执行报告
3. 🚀 开始准备生产环境（任务 #46）

### 如果部分失败

1. 📝 记录失败的阶段
2. 🔍 查看详细日志
3. 🛠️ 本地重现并修复问题
4. 🔄 重新推送代码

---

**文档版本**: 1.0.0
**创建时间**: 2026-03-03
