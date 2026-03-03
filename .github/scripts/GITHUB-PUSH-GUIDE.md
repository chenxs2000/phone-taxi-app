# GitHub 推送代码指南

本指南提供详细的步骤，帮助您将 Phone Taxi App 代码推送到 GitHub 并触发 CI/CD 流水线。

## 📋 前置条件

在开始之前，请确认：

- [ ] 您有 GitHub 账户
- [ ] 您已在 GitHub 上创建了仓库（phone-taxi-app）
- [ ] 您有仓库的 Admin/Owner 权限
- [ ] 您已阅读并理解 [Secrets 配置指南](SECRETS.md)

## 🚀 快速开始（3 步）

### 步骤 1: 准备 Git 仓库（1 分钟）

```bash
# 进入项目根目录
cd C:/Users/chenx/phone-taxi-app

# 运行 GitHub 准备脚本（查看状态）
.github/scripts/prepare-github.sh -s
```

**预期输出**:
```
=== Git 仓库状态 ===
📊 当前分支: HEAD (detached)
📊 远程仓库: 未配置
📊 最近提交: 无提交
📊 待提交文件: ~200 个文件
📊 CI/CD 文件状态: 工作流文件已创建
```

### 步骤 2: 配置远程仓库（2 分钟）

**重要提示**：如果您还没有创建 GitHub 仓库，请先创建！

**选项 A**: 使用已创建的仓库（跳过此步骤）

**选项 B**: 创建新的 GitHub 仓库（推荐）
1. 访问 https://github.com/new
2. 仓库名称: `phone-taxi-app`
3. 描述: `Phone Taxi App - Complete microservices system with CI/CD`
4. 选择 `Public` 或 `Private`（推荐 Public）
5. 点击 "Create repository"
6. 仓库创建成功后，复制仓库 URL

然后使用脚本配置：
```bash
# 将 YOUR_USERNAME 替换为实际用户名
.github/scripts/prepare-github.sh \
    -r https://github.com/YOUR_USERNAME/phone-taxi-app.git \
    -u YOUR_USERNAME
```

### 步骤 3: 创建并推送初始提交（5 分钟）

```bash
# 创建初始提交
.github/scripts/prepare-github.sh -c

# 推送到 GitHub
.github/scripts/prepare-github.sh -p

# 预期输出：
```
✓ 初始提交已创建
✓ 代码推送成功！
GitHub Actions 将自动触发
```

### 步骤 4: 验证 CI/CD 执行（10 分钟）

1. 访问 GitHub Actions 页面：
   ```
   https://github.com/YOUR_USERNAME/phone-taxi-app/actions
   ```

2. 查看 "Phone Taxi App CI/CD" 工作流

3. 监控各阶段执行：
   - 代码质量检查
   - 单元测试
   - 集成测试
   - 构建
   - Docker 镜像构建
   - 部署

4. 处理失败（如果有）：
   - 查看详细日志
   - 修复问题
   - 重新推送

---

## 🔧 详细使用说明

### 常用命令

#### 1. 查看当前状态
```bash
# 查看状态
.github/scripts/prepare-github.sh -s
```

#### 2. 配置远程仓库
```bash
# 替换 YOUR_USERNAME
.github/scripts/prepare-github.sh \
    -r https://github.com/YOUR_USERNAME/phone-taxi-app.git \
    -u YOUR_USERNAME
```

#### 3. 创建提交
```bash
# 创建初始提交
.github/scripts/prepare-github.sh -c

# 推送到 GitHub
.github/scripts/prepare-github.sh -p
```

#### 4. 强制推送（如果需要）
```bash
# 强制覆盖（谨慎使用）
.github/scripts/prepare-github.sh -f -p

# 或只查看状态
.github/scripts/prepare-github.sh -s
```

### 高级使用

#### 选项说明

| 选项 | 说明 | 示例 |
|------|------|--------|
| `-r, --remote` | 设置远程仓库 URL | `-r https://github.com/user/repo.git` |
| `-u, --username` | 设置 GitHub 用户名 | `-u myusername` |
| `-o, --organization` | 设置组织名 | `-o my-org` |
| `-c, --commit` | 创建提交 | `-c` |
| `-p, --push` | 推送代码 | `-p` |
| `-f, --force` | 强制执行 | `-f -p` |
| `-s, --status` | 显示状态 | `-s` |

### 故障排除

#### 问题：认证失败

**症状**:
```
fatal: could not read Username
authentication required
```

**解决方案**:
```bash
# 检查远程仓库 URL 是否正确
git remote get-url origin

# 重新配置
# .github/scripts/prepare-github.sh -r <correct-url> -u <username>
```

#### 问题：推送失败

**症状**:
```
fatal: repository not found
permission denied
```

**解决方案**:
1. 检查仓库名称是否正确
2. 验证远程仓库 URL
3. 确认用户名和权限
4. 如果需要，更新远程仓库配置：
```bash
# 移除旧配置
git remote remove origin

# 重新配置
git remote add origin <correct-url>
```

#### 问题：文件未提交

**症状**:
```
nothing to commit
```

**解决方案**:
```bash
# 查看未提交的文件
git status

# 添加所有文件
git add .

# 重新提交
git commit -m "Initial commit"
```

---

## 📊 验证清单

### 推送前检查

- [ ] Git 仓库已初始化
- [ ] 远程仓库已配置
- [ ] 所有文件已提交
- [ ] 分支名称正确
- [ ] CI/CD 工作流文件已存在

### 推送后检查

- [ ] 推送成功（无错误）
- [ ] 可以在 GitHub Actions 页面看到工作流
- [ ] 至少一个阶段开始执行

---

## 🎯 预期结果

### 成功标志

✅ Git 仓库配置正确
✅ 初始提交已创建
✅ 代码成功推送到 GitHub
✅ GitHub Actions CI/CD 流水线自动触发
✅ 可以在 Actions 页面查看执行情况

### 可能遇到的问题

⚠️ **问题 1**: 仓库名称或 URL 不正确
- 解决: 检查仓库 URL，更新配置

⚠️ **问题 2**: 认证失败
- 解决: 检查 GitHub Token 和用户名

⚠️ **问题 3**: 文件未提交
- 解决: 使用 `git add .` 提交所有文件

⚠️ **问题 4**: 网络连接问题
- 解决: 检查网络连接，重试推送

---

## 📞 后续步骤

### 推送成功后

1. **监控 CI/CD 执行**
   - 访问 GitHub Actions 页面
   - 查看各阶段状态
   - 处理任何失败

2. **配置 GitHub Secrets**
   - 按照 [Secrets 配置指南](SECRETS.md) 配置
   - 验证 Secrets 已添加

3. **准备测试环境**
   - 创建测试环境配置文件
   - 启动必要的服务

4. **优化 CI/CD 配置**
   - 根据执行结果调整配置
   - 优化构建和部署时间

---

## 🆘 获取帮助

如果遇到问题：

1. 查阅本文档的故障排除部分
2. 参考 GitHub Actions 文档: https://docs.github.com/en/actions
3. 查看项目 Issues 页面
4. 联系项目维护者

---

**文档版本**: 1.0.0
**创建时间**: 2026-03-03
**最后更新**: 2026-03-03
