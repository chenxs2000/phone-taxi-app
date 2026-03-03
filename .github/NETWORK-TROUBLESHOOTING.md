# GitHub 网络连接问题解决方案

## 🚨 当前问题

**错误信息**：
```
fatal: unable to access 'https://github.com/chenxs2000/phone-taxi-app.git/': Recv failure: Connection was reset
```

**原因**：网络连接被中断

---

## 🔧 解决方案 1: 等待并重试（最简单）

### 步骤：

1. **等待 1-2 分钟**

2. **重新尝试推送**：
   ```bash
   cd C:/Users/chenx/phone-taxi-app
   git push -u origin test-ci-cd
   ```

3. **如果仍然失败，等待更长时间再试**

---

## 🔧 解决方案 2: 使用 SSH 密钥（推荐，更稳定）

### 步骤 1: 生成 SSH 密钥

```bash
# 检查是否已有 SSH 密钥
ls ~/.ssh

# 如果没有，生成新的 SSH 密钥
ssh-keygen -t rsa -b 4096 -C "chenxs2000@github.com"
```

**输入提示**：
- 文件位置：按 Enter 使用默认路径
- 密码短语：可以直接按 Enter（留空）
- 确认密码短语：再次按 Enter

### 步骤 2: 显示公钥

```bash
# 显示公钥内容
cat ~/.ssh/id_rsa.pub
```

**复制公钥**（从 `ssh-rsa` 开始到邮箱地址结束）

### 步骤 3: 添加公钥到 GitHub

1. 访问：https://github.com/settings/ssh/new

2. **配置**：
   - Title: `Phone Taxi App CI/CD`
   - Key type: `Authentication Key`
   - Key: 粘贴刚才复制的公钥

3. 点击 "Add SSH key"

### 步骤 4: 测试 SSH 连接

```bash
ssh -T git@github.com
```

**成功标志**：
```
Hi chenxs2000! You've successfully authenticated...
```

**首次连接会提示**：
```
The authenticity of host 'github.com' can't be established.
...
Are you sure you want to continue connecting (yes/no)?
```

输入：`yes`

### 步骤 5: 切换到 SSH 远程仓库

```bash
cd C:/Users/chenx/phone-taxi-app

# 切换到 SSH 远程仓库
git remote set-url origin git@github.com:chenxs2000/phone-taxi-app.git

# 验证远程仓库
git remote -v
```

**应该看到**：
```
origin  git@github.com:chenxs2000/phone-taxi-app.git (fetch)
origin  git@github.com:chenxs2000/phone-taxi-app.git (push)
```

### 步骤 6: 使用 SSH 推送

```bash
git push -u origin test-ci-cd
```

**优势**：
- ✅ 不需要输入密码
- ✅ 更稳定
- ✅ 避免认证超时

---

## 🔧 解决方案 3: 检查网络连接

### 测试 GitHub 连接

```bash
# 测试基本连接
ping github.com

# 测试 HTTPS 连接
curl -I https://github.com

# 测试 Git 连接
git ls-remote https://github.com/chenxs2000/phone-taxi-app.git
```

### 检查防火墙

Windows 防火墙可能阻止了 Git 连接：

1. **打开 Windows Defender 防火墙**
   - 设置 → 系统和安全性 → Windows 安全中心
   - 防火墙和网络保护

2. **允许 Git 通过防火墙**
   - 点击 "允许应用通过防火墙"
   - 找到 Git 或 Git Bash
   - 勾选"专用网络"和"公用网络"

---

## 🔧 解决方案 4: 使用代理（如果需要）

### 如果使用代理

```bash
# 配置 Git 使用 HTTP 代理
git config --global http.proxy http://proxy-server:port
git config --global https.proxy https://proxy-server:port

# 或使用 SOCKS 代理
git config --global http.proxy socks5://proxy-server:port
```

### 清除代理设置

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

---

## 🔧 解决方案 5: 增加 Git 超时时间

```bash
# 增加 HTTP 缓冲区大小
git config --global http.postBuffer 524288000

# 增加超时时间（秒）
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999

# 设置更长的时间限制
git config --global http.timeout 300
```

---

## 🔧 解决方案 6: 使用 Git Credential Manager

### Windows 上的 Git Credential Manager

```bash
# 配置使用 Git Credential Manager
git config --global credential.helper manager-core

# 推送时会弹出认证窗口
git push -u origin test-ci-cd
```

---

## 🔧 解决方案 7: 手动上传文件（最后手段）

如果 Git 推送始终失败，可以手动上传文件：

### 步骤 1: 压缩项目文件

```bash
cd C:/Users/chenx

# 排除不必要的文件
tar --exclude='node_modules' --exclude='.git' -czf phone-taxi-app.tar.gz phone-taxi-app
```

### 步骤 2: 在 GitHub 上创建仓库（如果已存在跳过）

1. 访问：https://github.com/new
2. 创建仓库（如果还没有）

### 步骤 3: 下载并初始化（在 GitHub 页面操作）

1. 访问：https://github.com/chenxs2000/phone-taxi-app
2. 点击 "uploading an existing file"
3. 上传压缩包
4. 手动添加 `.github/workflows/ci-cd.yml`

**注意**：这不是推荐方法，仅作最后手段。

---

## 📊 推荐方案优先级

| 方案 | 优先级 | 难度 | 稳定性 |
|------|--------|------|--------|
| 等待重试 | ⭐ 最低 | 最简单 | 依赖网络 |
| SSH 密钥 | ⭐⭐⭐ 最高 | 中等 | 最稳定 |
| 检查网络 | ⭐⭐ 中等 | 简单 | 取决于结果 |
| 使用代理 | ⭐⭐ 中等 | 中等 | 取决于代理 |
| 增加超时 | ⭐ 最低 | 简单 | 效果有限 |
| Git Credential Manager | ⭐⭐ 中等 | 简单 | 较好 |
| 手动上传 | ⭐ 最低 | 最复杂 | 最不稳定 |

---

## 🎯 立即行动建议

### 选项 A: 快速尝试（1 分钟）

```bash
# 等待 1-2 分钟后重试
cd C:/Users/chenx/phone-taxi-app
git push -u origin test-ci-cd
```

### 选项 B: 配置 SSH 密钥（10 分钟，推荐）

1. 生成 SSH 密钥
2. 添加到 GitHub
3. 切换到 SSH 远程仓库
4. 推送代码

### 选项 C: 检查网络（2 分钟）

```bash
ping github.com
```

如果 ping 不通，检查网络连接或联系网络管理员。

---

## 📝 执行检查清单

### SSH 密钥配置检查清单

- [ ] 生成 SSH 密钥
- [ ] 复制公钥
- [ ] 添加公钥到 GitHub
- [ ] 测试 SSH 连接（ssh -T git@github.com）
- [ ] 切换到 SSH 远程仓库
- [ ] 推送代码

---

## 🚨 常见问题

### Q1: SSH 连接失败

**错误**：
```
ssh: connect to host github.com port 22: Connection timed out
```

**解决**：
- 检查防火墙
- 尝试使用 HTTPS over SSH（端口 443）
- 配置 SSH 使用端口 443：
  ```bash
  # 编辑 ~/.ssh/config
  Host github.com
      Hostname ssh.github.com
      Port 443
      User git
  ```

### Q2: 权限被拒绝

**错误**：
```
Permission denied (publickey)
fatal: Could not read from remote repository
```

**解决**：
- 确认公钥已添加到 GitHub
- 检查私钥文件权限
- 尝试重新生成 SSH 密钥

### Q3: 仍然连接失败

**解决**：
- 检查是否有 VPN 开启，尝试关闭
- 检查杀毒软件设置
- 尝试从不同网络连接

---

**文档版本**: 1.0.0
**创建时间**: 2026-03-03
