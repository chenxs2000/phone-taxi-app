# CI/CD 配置快速参考卡片

## 🎯 GitHub 配置和推送 - 快速参考

所有文档位置和用途的快速索引。

---

### 🔑 GitHub Secrets 相关文档

#### `.github/SECRETS.md`
**用途**: Secrets 概览和基本说明
**优先级**: 高（必须先完成）
**关键内容**:
- 3 个必需 Secrets 列表
- Secrets 基本概念说明
- 最佳实践和安全提醒

**何时查看**:
- 配置 GitHub Secrets 前

---

#### `.github/SECRETS-SETUP-GUIDE.md` 🔴 必须完成
**用途**: 详细的 Secrets 配置步骤指南
**优先级**: 最高（阻塞所有其他任务）
**关键内容**:
- GITHUB_TOKEN 创建的 7 个详细步骤
- DOCKER_USERNAME 和 DOCKER_PASSWORD 配置
- 可选 Secrets 配置（Slack、Snyk）
- GitHub CLI 验证方法
- 完整的检查清单
- 故障排除步骤

**何时使用**:
- 首次配置 GitHub Secrets 时

**预计时间**: 30 分钟

---

### 📋 CI/CD 工作流配置文档

#### `.github/workflows/ci-cd.yml`
**用途**: 主要的 CI/CD 工作流定义
**优先级**: 高
**关键内容**:
- 9 个自动化阶段
- 作业依赖关系
- 测试环境配置
- 自动部署策略
- 安全扫描集成

**何时使用**:
- 首次测试 CI/CD 流水线时
- 修改工作流配置时

---

#### `.github/README.md`
**用途**: CI/CD 使用说明
**优先级**: 高
**关键内容**:
- 手动触发工作流方法
- 查看执行日志
- 故障排除指南
- 环境配置说明

**何时使用**:
- 开始使用 CI/CD 功能时

---

### 🔧 辅助脚本文档

#### `.github/scripts/setup-env.sh`
**用途**: 环境配置自动化脚本
**优先级**: 中
**关键功能**:
- 创建测试环境配置
- 创建生产环境配置模板
- 支持单个/所有服务配置

**何时使用**:
- 准备部署环境时

---

#### `.github/scripts/deploy.sh`
**用途**: 自动化部署脚本
**优先级**: 中
**关键功能**:
- 单个/所有服务部署
- 强制部署选项
- 回滚支持
- 部署日志记录

**何时使用**:
- 部署应用时

---

#### `.github/scripts/prepare-github.sh`
**用途**: GitHub 准备和推送脚本
**优先级**: 高
**关键功能**:
- Git 仓库状态检查
- 远程仓库配置
- 提交和推送自动化
- 彩色状态显示

**何时使用**:
- 首次推送到 GitHub 时
- 后续推送代码时

---

#### `.github/scripts/simple-git-push.sh` 🆕 推荐
**用途**: 简化的 Git 推送脚本
**优先级**: 高
**关键功能**:
- 初始化、配置、提交、推送
- 状态显示
- 错误处理
- 彩色输出

**何时使用**:
- 首次推送到 GitHub 时
- 推荐用户使用此脚本

---

### 🔑 测试相关文档

#### `tests/integration/README.md`
**用途**: 集成测试运行指南
**优先级**: 中
**关键内容**:
- 测试环境准备步骤
- 运行集成测试命令
- 测试结果解释

**何时使用**:
- 运行集成测试前
- 验证测试结果时

---

#### `tests/integration/TEST-SUMMARY.md`
**用途**: 集成测试执行报告
**优先级**: 中
**关键内容**:
- 13 个测试的详细结果
- 功能验证总结
- 性能指标报告
- 发现的问题和限制

**何时使用**:
- 查看测试覆盖情况时

---

#### `tests/performance/load-test.yml`
**用途**: Artillery 性能测试配置
**优先级**: 低
**关键内容**:
- 负载测试阶段配置
- 测试场景定义
- 性能指标收集

**何时使用**:
- 运行性能测试时
- 性能基准测试时

---

### 📊 环境配置文件

#### `services/api-gateway/.env.staging`
**用途**: API Gateway 测试环境配置
**优先级**: 高
**关键内容**:
- 所有必需环境变量
- 数据库连接配置
- 服务 URL 配置
- 功能标志配置

**何时使用**:
- 启动测试环境时

---

#### `services/api-gateway/.env.production.example`
**用途**: API Gateway 生产环境配置模板
**优先级**: 高
**关键内容**:
- 所有必需的环境变量
- 占位符说明（需要填写）
- 安全配置示例
- 监控配置示例

**何时使用**:
- 准备生产环境时
- 填写真实配置值并复制为 `.env.production`

---

### 🔑 指南文档

#### `NEXT-STEPS.md`
**用途**: 后续步骤完整指南（本文档）
**优先级**: 高
**关键内容**:
- 详细步骤说明
- 预期结果标准
- 检查清单
- 监控要点
- 下一步行动计划

**何时使用**:
- 完成当前步骤 1-2 后
- 查看 NEXT-STEPS.md

---

## 🎯 按优先级查找

### 🔴 立即必须（阻塞所有其他任务）

**文档**:
- [x] `.github/SECRETS-SETUP-GUIDE.md` - Secrets 配置指南

**任务**:
- [x] 任务 #47 - 完成 GitHub Secrets 配置并推送代码

---

### 🟡 本周内完成（阻塞其他任务）

**文档**:
- [ ] 任务 #48 - 准备生产环境和监控基础设施

---

### 🟢 本月内完成（可选）

**任务**:
- [ ] 完善环境配置
- [ ] 设置监控基础设施

---

## 📞 常见问题

### Q: 推送代码时认证失败

**A**:
1. 检查 GITHUB_TOKEN 是否正确创建
2. 验证 Token 权限是否正确
3. 重新生成 Token 并更新

### Q: CI/CD 工作流失败

**A**:
1. 查看 Actions 页面错误日志
2. 检查工作流文件语法
3. 检查分支保护设置
4. 修复问题并重新推送

### Q: 部署到测试环境失败

**A**:
1. 检查环境配置文件
2. 验证测试环境数据库连接
3. 检查服务端口可用性

---

## 🔗 快速命令参考

### GitHub 准备和推送

```bash
# 查看状态
.github/scripts/simple-git-push.sh status

# 配置远程仓库（替换 YOUR_USERNAME）
.github/scripts/simple-git-push.sh add-remote \
    -r https://github.com/YOUR_USERNAME/phone-taxi-app.git \
    -u YOUR_USERNAME

# 初始化
.github/scripts/simple-git-push.sh init

# 创建提交
.github/scripts/simple-git-push.sh commit

# 推送
.github/scripts/simple-git-push.sh push
```

### 环境配置

```bash
# 为所有服务创建测试环境配置
.github/scripts/setup-env.sh staging

# 为 API Gateway 配置
github/scripts/setup-env.sh staging api-gateway
```

### Secrets 配置

```bash
# 参考 SECRETS-SETUP-GUIDE.md
```

---

**文档版本**: 1.0.0
**创建时间**: 2026-03-03
