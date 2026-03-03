# GitHub Secrets 配置文档

Phone Taxi App CI/CD 流水线需要以下 GitHub Secrets。

## 必需的 Secrets

### 1. `GITHUB_TOKEN`
- **用途**: GitHub 认证令牌
- **必需**: 是
- **权限**: repo, workflow
- **如何创建**:
  1. 进入 GitHub 设置 → Developer settings → Personal access tokens
  2. 创建新的 Personal Access Token
  3. 选择 `repo` 和 `workflow` 权限
  4. 复制生成的 token
  5. 进入仓库设置 → Secrets and variables → Actions
  6. 创建名为 `GITHUB_TOKEN` 的 secret
  7. 粘贴 token

### 2. `DOCKER_USERNAME`
- **用途**: Docker Registry 用户名
- **必需**: 是
- **值**: 你的 GitHub 用户名
- **如何设置**:
  1. 进入仓库设置 → Secrets and variables → Actions
  2. 创建名为 `DOCKER_USERNAME` 的 secret
  3. 粘贴你的 GitHub 用户名

### 3. `DOCKER_PASSWORD` (推荐使用 GitHub Token)
- **用途**: Docker Registry 密码
- **必需**: 是
- **推荐**: 使用 Personal Access Token 而非密码
- **如何创建**:
  1. 进入 GitHub 设置 → Developer settings → Personal access tokens
  2. 创建新的 Personal Access Token (勾选 `write:packages`)
  3. 复制生成的 token
  4. 进入仓库设置 → Secrets and variables → Actions
  5. 创建名为 `DOCKER_PASSWORD` 的 secret
  6. 粘贴 token

## 可选的 Secrets

### 4. `SLACK_WEBHOOK`
- **用途**: Slack 通知 Webhook URL
- **必需**: 否（失败时不发送通知）
- **如何设置**:
  1. 创建 Slack App → Incoming Webhooks
  2. 获取 Webhook URL
  3. 进入仓库设置 → Secrets and variables → Actions
  4. 创建名为 `SLACK_WEBHOOK` 的 secret
  5. 粘贴 Webhook URL

### 5. `SNYK_TOKEN`
- **用途**: Snyk 安全扫描 Token
- **必需**: 否（不运行安全扫描时可选）
- **如何创建**:
  1. 访问 https://snyk.io/
  2. 注册/登录
  3. 创建 API Token
  4. 进入仓库设置 → Secrets and variables → Actions
  5. 创建名为 `SNYK_TOKEN` 的 secret
  6. 粘贴 token

### 6. `AWS_ACCESS_KEY_ID`
- **用途**: AWS 访问密钥 ID（如果使用 AWS）
- **必需**: 否（仅 AWS 部署）
- **描述**: 用于部署到 AWS

### 7. `AWS_SECRET_ACCESS_KEY`
- **用途**: AWS 秘密访问密钥（如果使用 AWS）
- **必需**: 否（仅 AWS 部署）
- **描述**: 用于部署到 AWS

### 8. `KUBE_CONFIG`
- **用途**: Kubernetes 配置（如果使用 K8s）
- **必需**: 否（仅 K8s 部署）
- **描述**: Base64 编码的 kubeconfig 内容

## 环境变量配置

以下变量可以在工作流中配置，无需 Secrets：

### 已在 `.github/workflows/ci-cd.yml` 中配置的变量

```yaml
env:
  NODE_VERSION: '20.x'          # Node.js 版本
  MONGODB_VERSION: '7.0'       # MongoDB 版本
  REDIS_VERSION: '7-alpine'     # Redis 版本
  RABBITMQ_VERSION: '3.12'   # RabbitMQ 版本
  DOCKER_REGISTRY: ghcr.io       # Docker Registry
  ORGANIZATION: phone-taxi-app   # 组织名称
```

## 配置步骤

### 步骤 1: 创建必需的 Secrets

```bash
# 必需 Secrets 列表
GITHUB_TOKEN              ✅ 必需
DOCKER_USERNAME            ✅ 必需
DOCKER_PASSWORD            ✅ 必需（或使用 GITHUB_TOKEN）

# 可选 Secrets 列表
SLACK_WEBHOOK            ⚪ 可选（用于通知）
SNYK_TOKEN               ⚪ 可选（用于安全扫描）
```

### 步骤 2: 验证 Secrets

```bash
# 使用 GitHub CLI 验证 secrets（需要安装 gh CLI）
gh secret list

# 或在仓库设置中检查
# GitHub → Repository → Settings → Secrets and variables → Actions
```

### 步骤 3: 测试 CI/CD 流水线

```bash
# 1. 创建一个测试分支
git checkout -b test-ci-cd

# 2. 提交一个小的更改
echo "test" > test-file.txt
git add test-file.txt
git commit -m "Test CI/CD workflow"

# 3. 推送到 GitHub
git push origin test-ci-cd

# 4. 在 GitHub Actions 页面查看工作流运行
# https://github.com/YOUR_ORG/phone-taxi-app/actions
```

## Secrets 最佳实践

### ✅ 推荐做法

1. **使用 Personal Access Token 而非密码**
   - Token 可以设置权限和过期时间
   - 便于撤销和轮换
   - 更安全

2. **限制 Token 权限**
   - 只授予必要的权限
   - 不要使用过大的权限范围
   - 定期审查和更新权限

3. **Token 轮换**
   - 每 90 天轮换一次 token
   - 记录轮换日期
   - 删除不再使用的 token

4. **环境特定 Secrets**
   - 考虑为不同环境（staging、production）使用不同的 secrets
   - 使用命名约定：`STAGING_`*、`PRODUCTION_`*

5. **敏感数据处理**
   - 永远不要在日志中输出 secrets
   - 在工作流中正确引用 secrets
   - 使用 GitHub 提供的环境变量

### ❌ 避免做法

1. **不要将 secrets 提交到代码仓库**
2. **不要在公开的 Issue 或 PR 中泄露 secrets**
3. **不要使用过期的 secrets**
4. **不要为多个项目使用同一个 secrets**（如果可能）

## 故障排除

### 问题: Actions 工作流失败并提示 "Resource not accessible"

**原因**: Token 权限不足

**解决方案**:
1. 检查 `GITHUB_TOKEN` 是否有正确的权限
2. 确保选择了 `repo` 和 `workflow` 权限
3. 重新生成 token 并更新 secret

### 问题: Docker 推送失败

**原因**: Registry 认证失败

**解决方案**:
1. 验证 `DOCKER_USERNAME` 和 `DOCKER_PASSWORD` 是正确的
2. 检查 Docker Hub 或 GitHub Container Registry 设置
3. 确认账户有推送权限

### 问题: 部署作业失败

**原因**: 环境配置不正确

**解决方案**:
1. 检查 `.env.staging` 和 `.env.production` 文件
2. 验证所有必需的环境变量已设置
3. 确认部署环境（staging/production）URL 正确

## 安全检查清单

在首次运行 CI/CD 流水线前，请确认：

- [ ] 已创建 `GITHUB_TOKEN` secret
- [ ] 已创建 `DOCKER_USERNAME` secret
- [ ] 已创建 `DOCKER_PASSWORD` secret（或使用 GITHUB_TOKEN）
- [ ] Token 具有正确的权限
- [ ] 测试分支的更改
- [ ] 验证工作流配置
- [ ] 检查 Docker Registry 访问
- [ ] 设置 Slack 通知（可选）

## 联系和支持

如需帮助：
- GitHub Actions 文档: https://docs.github.com/en/actions
- Docker Hub 文档: https://docs.docker.com/
- Kubernetes 文档: https://kubernetes.io/docs/

---

**文档版本**: 1.0.0
**最后更新**: 2026-03-03
