# GitHub Actions CI/CD 使用指南

Phone Taxi App 的 CI/CD 流水线使用 GitHub Actions 实现自动化构建、测试和部署。

## 目录

- [快速开始](#快速开始)
- [工作流说明](#工作流说明)
- [环境配置](#环境配置)
- [手动触发](#手动触发)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)

## 快速开始

### 前置要求

1. ✅ GitHub 仓库已创建
2. ✅ 必需的 Secrets 已配置（见 [SECRETS.md](SECRETS.md)）
3. ✅ Dockerfile 已在各个服务目录中
4. ✅ 测试文件已创建

### 首次设置步骤

```bash
# 1. 克隆仓库
git clone https://github.com/YOUR_ORG/phone-taxi-app.git
cd phone-taxi-app

# 2. 配置 GitHub Secrets（参见 SECRETS.md）
# 在 GitHub 仓库设置中添加以下 secrets：
# - GITHUB_TOKEN
# - DOCKER_USERNAME
# - DOCKER_PASSWORD

# 3. 验证工作流文件
ls -la .github/workflows/
# 应该看到 ci-cd.yml 文件

# 4. 创建测试分支
git checkout -b test-ci-cd

# 5. 进行小的测试提交
echo "test" > test.txt
git add test.txt
git commit -m "Test CI/CD"
git push origin test-ci-cd

# 6. 在 GitHub 上监控工作流执行
# 访问 https://github.com/YOUR_ORG/phone-taxi-app/actions
```

## 工作流说明

### 工作流触发器

CI/CD 流水线会在以下情况自动触发：

```yaml
on:
  push:
    branches: [main, develop]        # 推送到主分支或开发分支
  pull_request:
    branches: [main, develop]        # 创建 Pull Request
  workflow_dispatch:                    # 手动触发（通过 GitHub UI）
```

### 工作流阶段

流水线分为以下阶段：

#### 1️⃣ 代码质量检查 (Lint)
- **触发器**: 推送或 Pull Request
- **内容**:
  - ESLint 代码检查
  - Prettier 格式检查
  - 上传 Lint 报告
- **并行**: 否（必须先通过）

#### 2️⃣ 单元测试 (Unit Tests)
- **触发器**: Lint 通过后
- **内容**:
  - 在多个操作系统上运行 (Ubuntu, Windows, macOS)
  - 测试多个 Node.js 版本 (18.x, 20.x)
  - 生成测试覆盖率报告
  - 上传覆盖率到 Codecov
- **并行**: 否（必须先通过）

#### 3️⃣ 集成测试 (Integration Tests)
- **触发器**: 单元测试通过后
- **服务**:
  - 启动 MongoDB、Redis、RabbitMQ
  - 运行集成测试套件
- **并行**: 否（必须先通过）

#### 4️⃣ 构建 (Build)
- **触发器**: 所有测试通过后
- **内容**:
  - 构建所有 7 个微服务
  - 并行构建不同服务
  - 上传构建产物
- **并行**: 是（不同服务可并行构建）

#### 5️⃣ Docker 镜像构建 (Docker Build)
- **触发器**: 构建通过后
- **内容**:
  - 使用 Docker Buildx 构建多平台镜像
  - 推送到 GitHub Container Registry
  - 生成镜像清单
  - 添加镜像元数据
- **并行**: 是

#### 6️⃣ 部署到测试环境 (Staging)
- **触发器**: Docker 构建通过后
- **条件**: 仅非主分支
- **内容**:
  - 部署到测试环境
  - 创建部署状态
  - 发送 Slack 通知
- **并行**: 否

#### 7️⃣ 部署到生产环境 (Production)
- **触发器**: Docker 构建通过后，且仅主分支推送
- **条件**: 主分支且 push 事件
- **内容**:
  - 创建版本标签
  - 部署到生产环境
  - 运行冒烟测试
  - 发送 Slack 通知
- **并行**: 否

#### 8️⃣ 性能测试 (Performance Tests)
- **触发器**: 测试环境部署后
- **条件**: 仅 develop 分支
- **内容**:
  - 使用 Artillery 运行负载测试
  - 生成性能报告
  - 上传性能测试报告
- **并行**: 否

#### 9️⃣ 安全扫描 (Security Scan)
- **触发器**: 构建通过后
- **内容**:
  - Trivy 容器安全扫描
  - Snyk 依赖漏洞扫描
  - 上传安全报告到 CodeQL
- **并行**: 是

#### 🔟 汇总通知 (Summary)
- **触发器**: 所有主要作业完成后
- **内容**:
  - 生成测试摘要
  - 创建 GitHub 状态徽章
  - 更新仓库状态

## 环境配置

### 测试环境 (Staging)

**配置文件**: `services/<service>/.env.staging`

**所需环境变量**:
```bash
# API Gateway
API_GATEWAY_URL=http://staging.phone-taxi.app/api

# 所有微服务
MONGODB_URI=mongodb://staging-mongodb:27017/phone-taxi?authSource=admin
REDIS_URI=redis://staging-redis:6379
RABBITMQ_URI=amqp://admin:password@staging-rabbitmq:5672

# JWT 配置
JWT_SECRET=staging-secret-key
JWT_EXPIRES_IN=7d

# 服务端口（默认）
PORT=3000  # 或其他服务的默认端口
```

### 生产环境 (Production)

**配置文件**: `services/<service>/.env.production`

**所需环境变量**:
```bash
# API Gateway
API_GATEWAY_URL=https://api.phone-taxi.app/api

# 生产数据库
MONGODB_URI=mongodb://prod-mongodb-27017/phone-taxi?authSource=admin
REDIS_URI=redis://prod-redis:6379
RABBITMQ_URI=amqp://admin:password@prod-rabbitmq:5672

# JWT 配置（使用更强的密钥）
JWT_SECRET=${{ secrets.PROD_JWT_SECRET }}
JWT_EXPIRES_IN=7d

# 其他生产配置
NODE_ENV=production
LOG_LEVEL=info
```

## 手动触发

### 通过 GitHub UI 触发

1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Phone Taxi App CI/CD" 工作流
4. 点击 "Run workflow" 按钮
5. 选择分支（可选）
6. 点击绿色 "Run workflow" 按钮

### 通过 CLI 触发

```bash
# 使用 GitHub CLI
gh workflow run "ci-cd.yml" --ref main

# 或使用 curl
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/YOUR_ORG/phone-taxi-app/actions/workflows/ci-cd.yml/dispatches \
  -d '{"ref":"main"}'
```

## 故障排除

### 工作流失败：Lint 错误

**常见原因**:
- 代码格式不符合规范
- 未使用的变量或导入
- TypeScript 类型错误

**解决方案**:
```bash
# 本地运行 lint 检查
npm run lint

# 自动修复格式问题
npm run lint:fix

# 重新提交并推送
git add .
git commit -m "Fix lint issues"
git push origin HEAD
```

### 工作流失败：测试超时

**常见原因**:
- 集成测试服务启动缓慢
- 网络连接问题
- 资源限制

**解决方案**:
1. 检查 GitHub Actions 运行器资源限制
2. 优化启动脚本，减少等待时间
3. 增加测试超时配置
4. 使用 GitHub 自托管运行器（如需要）

### 工作流失败：Docker 构建失败

**常见原因**:
- Dockerfile 语法错误
- 依赖下载失败
- 基础镜像不可用

**解决方案**:
```bash
# 本地测试 Docker 构建
docker build -t test-image .

# 测试容器运行
docker run --rm test-image npm test

# 检查 Dockerfile 语法
docker build --no-cache --check .
```

### 工作流失败：部署失败

**常见原因**:
- 目标环境不可达
- 部署脚本错误
- 配置不匹配

**解决方案**:
1. 检查部署环境 URL 是否正确
2. 验证部署权限（SSH、kubectl、docker-compose）
3. 查看部署日志以获取详细错误信息
4. 使用回滚功能恢复上一版本

## 最佳实践

### ✅ 代码质量

1. **在推送前本地运行 lint**
   ```bash
   npm run lint
   ```

2. **保持测试覆盖率**
   ```yaml
   # 新功能必须包含测试
   # 目标覆盖率：70%+
   ```

3. **遵循代码规范**
   - 使用 ESLint 配置
   - 遵循 TypeScript 严格模式
   - 定期更新依赖

### ✅ 测试策略

1. **单元测试优先**
   - 快速反馈循环（< 5 分钟）
   - 隔离依赖
   - 使用 mock

2. **集成测试验证关键路径**
   - 端到端业务流程
   - 服务间通信
   - 数据完整性

3. **性能测试定期运行**
   - 每次发布前
   - 定期基准测试
   - 监控响应时间趋势

### ✅ 部署策略

1. **蓝绿部署**
   - 零停机时间
   - 快速回滚
   - 降低风险

2. **金丝雀发布**
   - 逐步推出
   - A/B 测试
   - 快速发现问题

3. **功能标志**
   - 动态启用/禁用功能
   - 紧急关闭功能
   - 用户分级

### ✅ 监控和日志

1. **集中式日志**
   - 结构化日志格式
   - 日志聚合
   - 搜索和分析

2. **指标收集**
   - 业务指标
   - 技术指标
   - 自定义指标

3. **告警配置**
   - 主动告警
   - 告警分级
   - 告警路由

## 相关文档

- [Secrets 配置](SECRETS.md) - GitHub Secrets 详细说明
- [集成测试文档](tests/integration/README.md) - 集成测试运行指南
- [性能测试配置](tests/performance/load-test.yml) - Artillery 配置
- [部署脚本](scripts/deploy.sh) - 自动化部署脚本

## 支持

- GitHub Actions 文档: https://docs.github.com/en/actions
- GitHub Actions 示例: https://github.com/actions/starter-workflows
- Docker 文档: https://docs.docker.com/
- Kubernetes 文档: https://kubernetes.io/docs/

---

**文档版本**: 1.0.0
**最后更新**: 2026-03-03
