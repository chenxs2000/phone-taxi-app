# CI/CD 流水线首次测试指南

本指南提供详细的步骤说明，帮助您首次测试 Phone Taxi App 的 CI/CD 流水线。

## 📋 前置检查清单

在开始之前，请确认以下项目：

### Git 配置
- [ ] Git 仓库已初始化
- [ ] Git 用户信息已配置
- [ ] 测试分支 `test-ci-cd` 已创建
- [ ] 所有文件已提交到主分支

### GitHub 配置
- [ ] GitHub 账户可访问
- [ ] 仓库权限正确（Admin/Owner）
- [ ] GitHub Actions 已启用

### Secrets 配置
- [ ] GITHUB_TOKEN Secret 已创建（参考 SECRETS-SETUP-GUIDE.md）
- [ ] DOCKER_USERNAME Secret 已创建
- [ ] DOCKER_PASSWORD Secret 已创建（可以是 Token）

### 环境配置
- [ ] 测试环境 .env.staging 文件已创建
- [ ] 生产环境 .env.production.example 文件已创建
- [ ] 所有必要的配置项已填写

### CI/CD 工作流
- [ ] `.github/workflows/ci-cd.yml` 文件已创建
- [ ] 工作流配置正确（9个阶段）
- [ ] 所有作业依赖关系正确

---

## 🚀 执行步骤

### 步骤 1: 配置 GitHub Secrets（30 分钟）

#### 1.1 创建 GITHUB_TOKEN

1. 登录 GitHub：https://github.com

2. 进入 Settings：
   ```
   点击右上角头像 → Settings
   ```

3. 进入 Developer settings：
   ```
   左侧菜单底部 → Developer settings
   ```

4. 创建 Personal Access Token：
   ```
   点击 Personal access tokens
   点击 Generate new token (classic)
   填写：
     Note: Phone Taxi App CI/CD
     Expiration: 90 days
     Select scopes: ✅ repo (全部子选项)
                  ✅ workflow (允许运行 workflows)
   点击 Generate token
   立即复制生成的 Token（只显示一次）
   ```

5. 添加到 GitHub Secrets：
   ```
   进入 Phone Taxi App 仓库
   点击 Settings 标签
   左侧菜单 → Secrets and variables → Actions
   点击 New repository secret
   Name: GITHUB_TOKEN
   Value: [粘贴刚才复制的 Token]
   点击 Add secret
   确认看到 GITHUB_TOKEN 在列表中
   ```

#### 1.2 创建 DOCKER_USERNAME 和 DOCKER_PASSWORD

**选项 A：使用 GitHub Personal Access Token（推荐）**

1. 重复上述步骤 1-4，但这次配置：
   ```
   Note: Docker Registry Token - Phone Taxi App
   Expiration: 90 days
   Select scopes: ✅ write:packages (仅此选项)
   ```

2. 添加 DOCKER_USERNAME Secret：
   ```
   Name: DOCKER_USERNAME
   Value: [您的 GitHub 用户名]
   ```

3. 添加 DOCKER_PASSWORD Secret：
   ```
   Name: DOCKER_PASSWORD
   Value: [粘贴刚才复制的 Docker Token]
   ```

**选项 B：使用 Docker Hub Token**

1. 访问 Docker Hub：https://hub.docker.com/settings/security

2. 点击 New Access Token

3. 填写 Token 信息：
   ```
   Access Token Description: Phone Taxi App CI/CD
   Access permissions: ✅ Read & Write
   ```

4. 添加到 GitHub Secrets：
   ```
   DOCKER_USERNAME: [您的 Docker Hub 用户名]
   DOCKER_PASSWORD: [粘贴 Docker Hub Token]
   ```

---

### 步骤 2: 推送代码到 GitHub（5 分钟）

1. 确认当前在测试分支：
   ```bash
   git branch
   # 应该显示: * test-ci-cd
   ```

2. 查看将要推送的文件：
   ```bash
   git status
   # 应该显示很多新文件
   ```

3. 推送到 GitHub：
   ```bash
   # 如果您有 GitHub 访问权限，使用以下命令：
   git remote add origin https://github.com/YOUR_USERNAME/phone-taxi-app.git
   git push origin test-ci-cd

   # 或者使用 GitHub CLI（需要先认证）：
   gh auth login
   git push origin test-ci-cd

   # 提供仓库 URL
   https://github.com/YOUR_USERNAME/phone-taxi-app
   ```

4. 验证推送成功：
   - 访问 GitHub 仓库页面
   - 确认看到 `test-ci-cd` 分支
   - 检查提交历史记录

---

### 步骤 3: 监控 CI/CD 流水线执行（10-15 分钟）

1. 访问 GitHub Actions 页面：
   ```
   https://github.com/YOUR_USERNAME/phone-taxi-app/actions
   ```

2. 查看 "Phone Taxi App CI/CD" 工作流执行情况

3. 监控各阶段执行：
   ```
   阶段 1: 代码质量检查 (Lint)
   阶段 2: 单元测试 (Unit Tests)
   阶段 3: 集成测试 (Integration Tests)
   阶段 4: 构建 (Build)
   阶段 5: Docker 镜像构建 (Docker Build)
   阶段 6: 部署到测试环境 (Staging)
   ```

4. 点击正在运行的作业查看详细日志：
   ```
   点击作业名称 → 查看输出
   检查是否有错误信息
   下载日志文件（如果需要）
   ```

5. 检查生成的产物：
   ```
   在作业完成后，点击 Artifacts 标签
   下载 Lint 报告、测试覆盖率、构建产物等
   ```

---

### 步骤 4: 验证测试结果（5 分钟）

1. 检查作业状态：
   ```
   绿色 ✓：成功
   红色 ✗：失败
   黄色 ⚠：警告/跳过
   ```

2. 查看测试摘要：
   ```
   在作业列表底部应该显示测试摘要
   点击查看详细信息
   ```

3. 验证关键功能：
   ```
   - Lint 作业应该成功
   - 单元测试应该通过（允许部分失败）
   - 集成测试应该通过（我们本地测试过）
   - Docker 镜像应该成功构建和推送
   ```

---

## 🐛 故障排除

### 常见问题

#### 问题 1: 工作流无法找到

**症状**：
- GitHub Actions 页面看不到工作流
- 推送后没有触发工作流

**可能原因**：
1. 工作流文件路径错误
2. 文件名不正确
3. 仓库权限不足

**解决方案**：
```bash
# 检查工作流文件是否存在
ls -la .github/workflows/

# 应该看到 ci-cd.yml

# 确认文件权限
cat .github/workflows/ci-cd.yml
```

#### 问题 2: Lint 作业失败

**症状**：
- ESLint 报告大量错误
- Prettier 检查失败

**解决方案**：
```bash
# 本地运行 lint 检查
npm run lint

# 自动修复格式问题
npm run lint:fix

# 提交修复
git add .
git commit -m "Fix lint issues"
git push origin test-ci-cd
```

#### 问题 3: 测试失败

**症状**：
- 单元测试失败
- 集成测试失败

**解决方案**：
```bash
# 本地运行测试
npm run test

# 查看具体错误信息
# 修复问题

# 提交修复
git add .
git commit -m "Fix test failures"
git push origin test-ci-cd
```

#### 问题 4: Docker 构建失败

**症状**：
- Docker 镜像构建失败
- 推送到 Registry 失败

**可能原因**：
1. Dockerfile 语法错误
2. 依赖下载失败
3. 推送权限不足
4. Registry 配置错误

**解决方案**：
```bash
# 检查 Dockerfile 语法
docker build --check -f services/user-service/Dockerfile

# 本地测试构建
docker build -t test-image services/user-service

# 检查 secrets 配置
# GitHub: Settings → Secrets and variables → Actions
# 确认所有必需的 secrets 都已添加
```

#### 问题 5: 部署失败

**症状**：
- 部署作业失败
- 健康检查失败

**解决方案**：
```bash
# 手动测试部署
.github/scripts/deploy.sh staging -s api-gateway

# 检查部署日志
# GitHub Actions → 作业日志
# 查找具体错误信息

# 回滚到上一版本
.github/scripts/deploy.sh staging -r -s api-gateway
```

---

## 📊 成功标准

### 首次成功的标志

首次 CI/CD 运行应该满足以下条件：

- ✅ 所有 9 个阶段都执行完成
- ✅ 至少 8 个阶段成功（允许一个阶段失败）
- ✅ Docker 镜像成功构建
- ✅ 至少部署到测试环境
- ✅ 没有严重错误
- ✅ 总执行时间 < 30 分钟

### 关键成功指标

| 阶段 | 成功标准 |
|--------|---------|
| 代码质量检查 | 无阻塞性错误 |
| 单元测试 | 覆盖率 > 70% |
| 集成测试 | 主要测试通过 |
| 构建 | 所有服务构建成功 |
| Docker 镜像 | 成功推送到 Registry |
| 部署 | 测试环境部署成功 |

---

## 📈 后续步骤

### 首次成功后的后续任务

1. **创建 Pull Request 到主分支**
   ```bash
   git checkout main
   git pull origin main
   git checkout test-ci-cd
   git merge main --no-edit
   git push origin test-ci-cd

   # 然后在 GitHub 上创建 PR
   ```

2. **准备生产环境**
   - 完善所有 `.env.production` 文件
   - 配置真实的数据库连接字符串
   - 设置强密钥和密码
   - 配置监控端点

3. **设置监控基础设施**
   - 部署 Prometheus + Grafana
   - 配置 ELK Stack 日志收集
   - 设置告警规则

4. **配置域名和 DNS**
   - 购买域名
   - 配置 DNS 解析
   - 设置 SSL/TLS 证书

5. **高可用性准备**
   - 准备多个生产实例
   - 配置负载均衡器
   - 实现蓝绿部署策略

---

## 📝 完成检查清单

在完成首次测试后，请确认：

### 代码和配置
- [ ] 所有 CI/CD 配置文件已创建
- [ ] GitHub Secrets 已配置
- [ ] 测试代码已推送到 GitHub
- [ ] CI/CD 工作流成功运行至少一次

### 测试结果
- [ ] Lint 阶段通过
- [ ] 单元测试阶段通过（大部分）
- [ ] 集成测试阶段通过
- [ ] 构建阶段成功
- [ ] Docker 镜像阶段成功
- [ ] 部署到测试环境成功

### 文档
- [ ] Secrets 配置指南已阅读
- [ ] CI/CD 使用说明已阅读
- [ ] 环境配置文件已准备
- [ ] 故障排除文档已查阅

---

## 🎯 预期时间线

- **步骤 1 (Secrets)**: 30 分钟
- **步骤 2 (推送)**: 10 分钟
- **步骤 3 (监控)**: 15 分钟
- **步骤 4 (验证)**: 5 分钟
- **总计**: 约 1 小时

---

**创建日期**: 2026-03-03
**文档版本**: 1.0.0
**预计测试完成**: 推送代码后 30 分钟内

## 🆘 需要帮助？

如果在此过程中遇到问题，请：

1. 查阅故障排除部分
2. 参考 GitHub Actions 文档：https://docs.github.com/en/actions
3. 检查项目仓库的 Issues
4. 联系项目维护者

---

**下一步建议**：首次成功后，建议将 `test-ci-cd` 分支合并到 `main` 分支，然后继续进行生产环境准备和监控配置。