# GitHub Secrets 配置向导和检查清单

本指南提供详细的步骤说明，帮助您在 GitHub 仓库中正确配置 CI/CD 流水线所需的 Secrets。

## 📋 配置检查清单

在开始之前，请确认以下项目：

- [ ] 您有 GitHub 账户并可以访问 Phone Taxi App 仓库
- [ ] 您有仓库的 Admin/Owner 权限
- [ ] 您的 GitHub 账户已启用 Two-Factor Authentication (推荐)
- [ ] 您了解 GitHub Personal Access Token 的作用

## 🔑 Secret 配置步骤

### Secret #1: GITHUB_TOKEN

这是 CI/CD 流水线使用的主要认证 Token。

#### 步骤 1.1: 创建 Personal Access Token

1. 登录 GitHub
2. 点击右上角头像 → **Settings**
3. 在左侧菜单中找到 **Developer settings** (底部)
4. 点击 **Personal access tokens** (左侧)
5. 点击 **Generate new token (classic)** 或 **Generate new token**
6. 填写 Token 信息：
   ```
   Note: Phone Taxi App CI/CD
   Expiration: 90 days (或 365 days)
   Select scopes: ✅ repo (勾选所有子选项)
                       ✅ workflow (允许运行 workflows)
                       ❌ admin (不需要)
                       ❌ delete_repo (不需要)
                       ❌ gist (不需要)
   ```
7. 点击 **Generate token** 按钮
8. **重要**: 立即复制生成的 Token（只显示一次）

#### 步骤 1.2: 在仓库中添加 GITHUB_TOKEN Secret

1. 进入 Phone Taxi App 仓库
2. 点击 **Settings** 标签 (仓库顶部)
3. 在左侧菜单中找到 **Secrets and variables** → **Actions**
4. 点击 **New repository secret** 按钮
5. 填写 Secret 信息：
   ```
   Name: GITHUB_TOKEN
   Value: [粘贴刚才复制的 Token]
   ```
6. 点击 **Add secret** 按钮
7. ✅ 确认看到 GITHUB_TOKEN 在 Secrets 列表中

---

### Secret #2: DOCKER_USERNAME

Docker Registry 用户名，用于推送镜像。

#### 步骤 2.1: 确定用户名

**使用 GitHub 用户名（推荐）**:
- 您的 GitHub 用户名（与 `GITHUB_TOKEN` 使用相同账户）
- 通常格式: `your-username`

**使用 Docker Hub 用户名（可选）**:
- 如果使用 Docker Hub 而非 GitHub Container Registry
- 您的 Docker Hub 账户用户名

**确认用户名**:
```bash
# 查看当前用户
git config --global user.name  # Git 用户名
whoami                    # 系统用户名
```

#### 步骤 2.2: 在仓库中添加 DOCKER_USERNAME Secret

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 点击 **New repository secret** 按钮
3. 填写 Secret 信息：
   ```
   Name: DOCKER_USERNAME
   Value: [您的用户名]
   ```
4. 点击 **Add secret** 按钮
5. ✅ 确认看到 DOCKER_USERNAME 在 Secrets 列表中

---

### Secret #3: DOCKER_PASSWORD

Docker Registry 密码或 Token。

#### 方案 A: 使用 GitHub Personal Access Token (推荐)

**推荐理由**:
- Token 可以设置精确的权限
- Token 可以设置过期时间
- 便于撤销和轮换
- 更安全（不在密码管理器中）

#### 步骤 3.1-A: 创建新的 Personal Access Token

1. 进入 GitHub → Settings → Developer settings → Personal access tokens
2. 点击 **Generate new token (classic)**
3. 填写 Token 信息：
   ```
   Note: Docker Registry Token - Phone Taxi App
   Expiration: 90 days
   Select scopes: ✅ write:packages (勾选)
                       ✅ read:packages (可选)
                       ❌ 其他所有选项都不勾选
   ```
4. 点击 **Generate token** 按钮
5. **重要**: 立即复制生成的 Token

#### 步骤 3.2-A: 添加 DOCKER_PASSWORD Secret

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 点击 **New repository secret** 按钮
3. 填写 Secret 信息：
   ```
   Name: DOCKER_PASSWORD
   Value: [粘贴刚才复制的 Token]
   ```
4. 点击 **Add secret** 按钮
5. ✅ 确认看到 DOCKER_PASSWORD 在 Secrets 列表中

#### 方案 B: 使用 Docker Hub Token (可选)

如果使用 Docker Hub Registry：

1. 访问 https://hub.docker.com/settings/security
2. 点击 **New Access Token**
3. 填写 Token 信息：
   ```
   Access Token Description: Phone Taxi App CI/CD
   Access permissions: Read & Write
   ```
4. 点击 **Generate**
5. 复制 Token
6. 在 GitHub 中添加为 DOCKER_PASSWORD Secret

---

### 可选 Secrets 配置

#### Secret #4: SLACK_WEBHOOK (可选)

用于发送 CI/CD 部署通知到 Slack。

**步骤**:
1. 在 Slack 工作区创建 App
2. 启用 Incoming Webhooks
3. 复制生成的 Webhook URL
4. 在 GitHub 中添加为 SLACK_WEBHOOK Secret

**Slack App 配置**:
```json
{
  "display_information": {
    "background_color": "#0066ff",
    "description": "Phone Taxi App CI/CD Notifications",
    "name": "Phone Taxi CI/CD"
  }
}
```

#### Secret #5: SNYK_TOKEN (可选)

用于依赖包安全扫描。

**步骤**:
1. 访问 https://snyk.io/
2. 注册/登录
3. 进入 API Tokens 设置
4. 创建新的 API Token
5. 复制 Token
6. 在 GitHub 中添加为 SNYK_TOKEN Secret

---

## ✅ 配置验证

### 测试 Secrets 配置

#### 方法 1: 使用 GitHub CLI 验证

```bash
# 安装 GitHub CLI（如果未安装）
# macOS
brew install gh

# Windows
winget install --id GitHub.cli

# Linux
# 查看发行版说明 https://github.com/cli/cli/releases/latest

# 验证 Secrets
gh secret list
```

**预期输出**:
```
GH_SECRETS
  GITHUB_TOKEN     Updated 2026-03-03
  DOCKER_USERNAME  Updated 2026-03-03
  DOCKER_PASSWORD  Updated 2026-03-03
```

#### 方法 2: 在仓库设置中手动验证

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 确认看到以下 Secrets：
   - ✅ GITHUB_TOKEN
   - ✅ DOCKER_USERNAME
   - ✅ DOCKER_PASSWORD

---

## 🔐 环境配置准备

### 测试环境配置文件创建

为测试环境创建配置模板：

```bash
# 创建测试环境配置文件
cat > services/api-gateway/.env.staging << 'EOF'
# API Gateway - 测试环境
API_GATEWAY_URL=http://staging.phone-taxi.app/api
NODE_ENV=staging
LOG_LEVEL=debug

# 数据库连接
MONGODB_URI=mongodb://staging-mongodb:27017/phone-taxi-staging?authSource=admin
REDIS_URI=redis://staging-redis:6379
RABBITMQ_URI=amqp://admin:password@staging-rabbitmq:5672

# JWT 配置
JWT_SECRET=staging-secret-key-change-me-in-production
JWT_EXPIRES_IN=7d

# 服务端口
PORT=3000
EOF

# 为其他服务创建类似的 .env.staging 文件
```

### 生产环境配置文件创建

```bash
# 创建生产环境配置文件（仅参考，不要使用实际密钥）
cat > services/api-gateway/.env.production.example << 'EOF'
# API Gateway - 生产环境
API_GATEWAY_URL=https://api.phone-taxi.app/api
NODE_ENV=production
LOG_LEVEL=info

# 生产数据库（使用真实的连接字符串）
MONGODB_URI=mongodb://prod-user:prod-password@prod-mongodb:27017/phone-taxi-prod?authSource=admin
REDIS_URI=redis://prod-user:prod-password@prod-redis:6379
RABBITMQ_URI=amqp://prod-user:prod-password@prod-rabbitmq:5672

# JWT 配置（使用强密钥）
JWT_SECRET=${{ secrets.PROD_JWT_SECRET }} # 使用强随机密钥
JWT_EXPIRES_IN=7d

# 服务端口
PORT=3000
EOF
```

---

## ⚠️ 重要注意事项

### 安全性

1. **绝对不要**:
   - ❌ 将 secrets 提交到 Git 仓库
   - ❌ 在公开的 Issue 或 PR 中泄露 secrets
   - ❌ 在代码中硬编码 secrets
   - ❌ 在日志中输出 secrets
   - ❌ 分享 secrets 给他人

2. **必须**:
   - ✅ 使用 GitHub Secrets 功能
   - ✅ 定期轮换 secrets（推荐 90 天）
   - ✅ 使用最小权限原则
   - ✅ 监控 secrets 使用情况

### Token 管理

1. **Token 轮换策略**:
   ```
   设置日历提醒：每 90 天轮换一次
   记录轮换日期和使用的 token
   删除不再使用的 old tokens
   ```

2. **Token 权限审查**:
   ```
   定期检查 token 是否有过多的权限
   如发现，删除并创建新的最小权限 token
   ```

3. **紧急处理**:
   ```
   如果 token 意外泄露：
   1. 立即在 GitHub 撤销 token
   2. 旋转所有相关的 secrets
   3. 检查是否有异常活动
   ```

---

## 📞 故障排除

### 问题: Secrets 无法添加

**可能原因**:
1. 仓库名称不正确
2. 没有管理员权限
3. Token 格式错误

**解决方案**:
```bash
# 确认仓库名称
gh repo view

# 如果使用 CLI，确保已正确认证
gh auth login

# 检查仓库权限
# 在仓库 Settings → Collaborators 中检查
```

### 问题: Actions 工作流失败

**可能原因**:
1. GITHUB_TOKEN 权限不足
2. DOCKER_USERNAME 或 DOCKER_PASSWORD 错误
3. Workflow 语法错误

**解决方案**:
```bash
# 查看 Actions 运行日志
# https://github.com/YOUR_ORG/phone-taxi-app/actions

# 本地测试 workflow 语法
# 使用 GitHub Actions Validator:
# https://actions.github.com/
```

---

## 🎯 配置完成检查表

### 必需配置（必须全部完成）

- [ ] GITHUB_TOKEN 已添加 ✅
- [ ] DOCKER_USERNAME 已添加 ✅
- [ ] DOCKER_PASSWORD 已添加 ✅（可以是 Token）
- [ ] 所有 secrets 已验证

### 预配置（可选）

- [ ] SLACK_WEBHOOK 已添加（如果需要通知）
- [ ] SNYK_TOKEN 已添加（如果需要安全扫描）

### 环境准备

- [ ] 测试环境 .env.staging 文件已创建
- [ ] 生产环境 .env.production.example 文件已创建

### 验证测试

- [ ] GitHub CLI 已安装并验证
- [ ] Secrets 列表已查看确认

---

## 📞 技术支持

如遇到问题：

1. **GitHub Actions 文档**: https://docs.github.com/en/actions
2. **Personal Access Tokens**: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
3. **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
4. **Docker Packages**: https://docs.github.com/en/packages/learn-github-packages

---

**配置向导版本**: 1.0.0
**创建日期**: 2026-03-03
**预计配置时间**: 10-15 分钟
