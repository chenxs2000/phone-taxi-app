# Git HTTPS 连接重置问题解决方案

## 🚨 当前问题

**错误**：
```
fatal: unable to access 'https://github.com/chenxs2000/phone-taxi-app.git/': Recv failure: Connection was reset
```

**诊断**：
- ✅ 基本网络连接正常（ping github.com 成功）
- ❌ Git HTTPS 连接被重置

**可能原因**：
1. Git 缓冲区太小
2. 防火墙或杀毒软件阻止 HTTPS 连接
3. Git 版本问题
4. SSL/TLS 配置问题
5. 代理或网络设备干扰

---

## 🔧 解决方案 1: 增加 Git 缓冲区（最可能的原因）

### 问题原因

Git 默认的 HTTP 缓冲区（1MB）对于大项目来说太小，导致连接被重置。

### 解决方法

```powershell
cd C:/Users/chenx/phone-taxi-app

# 增加缓冲区到 500MB
git config --global http.postBuffer 524288000

# 验证配置
git config --global http.postBuffer
```

**预期输出**：
```
524288000
```

### 重新尝试推送

```powershell
git push -u origin test-ci-cd
```

---

## 🔧 解决方案 2: 配置 Git 忽略 SSL 错误（临时解决）

### 警告
这是临时解决方案，会降低安全性。仅用于诊断。

```powershell
# 忽略 SSL 验证
git config --global http.sslVerify false

# 尝试推送
git push -u origin test-ci-cd

# 推送成功后，恢复 SSL 验证
git config --global http.sslVerify true
```

---

## 🔧 解决方案 3: 检查 Git 版本

### 查看当前 Git 版本

```powershell
git --version
```

### 更新 Git（如果版本过旧）

1. 访问：https://git-scm.com/download/win
2. 下载最新版本
3. 安装并重启终端

### 重新尝试推送

```powershell
cd C:/Users/chenx/phone-taxi-app
git push -u origin test-ci-cd
```

---

## 🔧 解决方案 4: 使用 Git Credential Manager for Windows

### 配置 Git Credential Manager

```powershell
# 配置使用 Windows Credential Manager
git config --global credential.helper manager

# 清除之前的凭据
git config --global --unset credential.helper
git config --global credential.helper manager
```

### 推送（会弹出认证窗口）

```powershell
cd C:/Users/chenx/phone-taxi-app
git push -u origin test-ci-cd
```

**优势**：
- 会弹出 Windows 认证窗口
- 不需要在命令行输入密码
- 更稳定的认证

---

## 🔧 解决方案 5: 切换到 SSH（最稳定）

虽然基本网络连接正常，但 HTTPS 连接可能受干扰。SSH 通常更稳定。

### 步骤 1: 检查是否已有 SSH 密钥

```powershell
# 检查 SSH 密钥
ls ~/.ssh
```

**如果看到 `id_rsa` 和 `id_rsa.pub`，已有密钥，跳到步骤 3**

### 步骤 2: 生成 SSH 密钥

```powershell
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "chenxs2000@github.com"
```

**提示**：
- 文件位置：按 Enter
- 密码：按 Enter（留空）
- 确认密码：按 Enter

### 步骤 3: 显示并复制公钥

```powershell
# 显示公钥
cat ~/.ssh/id_ed25519.pub
```

复制输出内容

### 步骤 4: 添加公钥到 GitHub

1. 访问：https://github.com/settings/ssh/new
2. 填写：
   - Title: `Phone Taxi App CI/CD`
   - Key: 粘贴公钥
3. 点击 "Add SSH key"

### 步骤 5: 测试 SSH 连接

```powershell
ssh -T git@github.com
```

**首次连接提示**：
```
The authenticity of host 'github.com' can't be established.
...
Are you sure you want to continue connecting (yes/no)?
```

输入：`yes`

**成功标志**：
```
Hi chenxs2000! You've successfully authenticated...
```

### 步骤 6: 切换到 SSH 远程仓库

```powershell
cd C:/Users/chenx/phone-taxi-app

# 切换到 SSH
git remote set-url origin git@github.com:chenxs2000/phone-taxi-app.git

# 验证
git remote -v
```

**应该看到**：
```
origin  git@github.com:chenxs2000/phone-taxi-app.git (fetch)
origin  git@github.com:chenxs2000/phone-taxi-app.git (push)
```

### 步骤 7: 使用 SSH 推送

```powershell
git push -u origin test-ci-cd
```

**优势**：
- ✅ 不需要输入密码
- ✅ 更稳定的连接
- ✅ 避免 HTTPS 认证问题

---

## 🔧 解决方案 6: 检查防火墙和杀毒软件

### Windows Defender 防火墙

1. 打开 Windows 安全中心
2. 进入防火墙设置
3. 允许 Git 或 Git Bash 通过防火墙

### 杀毒软件

某些杀毒软件可能拦截 Git 连接：
- 临时禁用杀毒软件
- 将 Git 添加到白名单

### 公司网络

如果您在公司网络：
- 可能有网络设备干扰
- 联系 IT 管理员

---

## 🔧 解决方案 7: 使用浅推送（减少数据量）

```powershell
cd C:/Users/chenx/phone-taxi-app

# 使用浅推送（只推送最新的提交）
git push -u origin test-ci-cd --depth=1
```

---

## 🔧 解决方案 8: 重置 Git 配置

```powershell
# 重置 Git 网络配置
git config --global --unset http.proxy
git config --global --unset https.proxy
git config --global --unset http.sslVerify
git config --global --unset http.postBuffer

# 尝试推送
git push -u origin test-ci-cd
```

---

## 📊 解决方案优先级（针对 HTTPS 连接问题）

| 解决方案 | 优先级 | 成功率 | 时间 |
|---------|--------|--------|------|
| 增加缓冲区 | ⭐⭐⭐⭐⭐ | 高 | 1 分钟 |
| 忽略 SSL（临时） | ⭐⭐⭐ | 中 | 2 分钟 |
| Git Credential Manager | ⭐⭐⭐⭐ | 高 | 3 分钟 |
| 切换到 SSH | ⭐⭐⭐⭐⭐ | 最高 | 10 分钟 |
| 更新 Git 版本 | ⭐⭐ | 中 | 10 分钟 |
| 检查防火墙 | ⭐⭐ | 中 | 5 分钟 |
| 浅推送 | ⭐ | 低 | 1 分钟 |

---

## 🎯 推荐执行顺序

### 第一步：增加缓冲区（1 分钟）

```powershell
cd C:/Users/chenx/phone-taxi-app

git config --global http.postBuffer 524288000
git push -u origin test-ci-cd
```

### 如果失败：使用 Git Credential Manager（3 分钟）

```powershell
git config --global credential.helper manager
git push -u origin test-ci-cd
```

### 如果仍然失败：切换到 SSH（10 分钟）

1. 生成 SSH 密钥
2. 添加到 GitHub
3. 切换远程仓库
4. 推送

---

## 📝 执行检查清单

### 增加缓冲区检查清单

- [ ] 执行 `git config --global http.postBuffer 524288000`
- [ ] 验证配置：`git config --global http.postBuffer`
- [ ] 尝试推送：`git push -u origin test-ci-cd`
- [ ] 查看是否成功

### Git Credential Manager 检查清单

- [ ] 配置 Credential Manager
- [ ] 清除之前的凭据
- [ ] 尝试推送（会弹出认证窗口）
- [ ] 在弹窗中输入凭据

### SSH 密钥检查清单

- [ ] 生成 SSH 密钥
- [ ] 复制公钥
- [ ] 添加公钥到 GitHub
- [ ] 测试 SSH 连接：`ssh -T git@github.com`
- [ ] 切换到 SSH 远程仓库
- [ ] 使用 SSH 推送

---

## 🚨 如果所有方法都失败

### 最后的手段：手动上传关键文件

由于主要目标是触发 CI/CD，可以手动上传工作流文件：

1. 访问：https://github.com/chenxs2000/phone-taxi-app
2. 点击 "Add file" → "Create new file"
3. 创建文件：`.github/workflows/ci-cd.yml`
4. 复制本地的文件内容粘贴进去
5. 点击 "Commit changes"

这样至少可以触发 CI/CD 工作流。

---

**文档版本**: 1.0.0
**创建时间**: 2026-03-03
