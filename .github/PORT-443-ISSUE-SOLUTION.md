# GitHub 443 端口连接问题解决方案

## 🚨 当前问题

**错误信息**：
```
fatal: unable to access 'https://github.com/chenxs2000/phone-taxi-app.git/': Failed to connect to github.com port 443 after 21081 ms: Could not connect to server
```

**诊断结果**：
- ✅ 基本网络连接正常（ping github.com 成功）
- ❌ 无法连接到 GitHub 的 443 端口（HTTPS）
- ⏱️ 连接超时时间很长（21 秒）

**结论**：网络环境阻止了 GitHub 的 443 端口连接

---

## 🔍 问题诊断

### 步骤 1: 检查 Git 代理配置

```powershell
# 检查 HTTP 代理配置
git config --global --get http.proxy

# 检查 HTTPS 代理配置
git config --global --get https.proxy
```

**如果输出不是空的**，说明 Git 配置了代理，可能是代理不可用导致的。

### 步骤 2: 测试 443 端口连接

```powershell
# 使用 PowerShell 测试 HTTPS 连接
Test-NetConnection -ComputerName github.com -Port 443
```

**可能的结果**：
- `TcpTestSucceeded : True` - 端口可用
- `TcpTestSucceeded : False` - 端口被阻止

### 步骤 3: 测试 22 端口（SSH）

```powershell
# 测试 SSH 端口
Test-NetConnection -ComputerName github.com -Port 22
```

---

## 🔧 解决方案 1: 清除 Git 代理配置

### 如果 Git 配置了代理

```powershell
# 清除 HTTP 代理
git config --global --unset http.proxy

# 清除 HTTPS 代理
git config --global --unset https.proxy

# 重新尝试推送
cd C:/Users/chenx/phone-taxi-app
git push -u origin test-ci-cd
```

---

## 🔧 解决方案 2: 配置正确的代理（如果需要）

### 如果必须使用代理

```powershell
# 配置 HTTP 代理
git config --global http.proxy http://proxy-server:port

# 配置 HTTPS 代理
git config --global https.proxy https://proxy-server:port
```

**替换 `proxy-server:port` 为实际的代理地址**

---

## 🔧 解决方案 3: 使用 SSH（端口 22，绕过 443 问题）

**这是最推荐的解决方案！**

### 为什么 SSH 可能工作？

- SSH 使用 22 端口，而不是 443
- 很多网络环境允许 22 端口，但阻止 443
- SSH 更稳定且安全

### 步骤 1: 检查 22 端口是否可用

```powershell
# 测试 SSH 端口
Test-NetConnection -ComputerName github.com -Port 22
```

**如果是 True，说明 SSH 可用！**

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
   - **Title**: `Phone Taxi App CI/CD`
   - **Key**: 粘贴公钥
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

**不需要输入密码！**

---

## 🔧 解决方案 4: 使用 SSH over HTTPS（端口 443，但使用 SSH 协议）

### 如果 22 端口也被阻止

GitHub 提供了一个特殊的 SSH 端口：443

### 步骤 1: 创建 SSH 配置文件

```powershell
# 编辑 SSH 配置
notepad ~/.ssh/config
```

### 步骤 2: 添加以下内容

```
Host github.com
    Hostname ssh.github.com
    Port 443
    User git
```

### 步骤 3: 保存并测试

```powershell
# 测试 SSH over HTTPS
ssh -T github.com

# 如果测试成功，切换到 SSH 并推送
cd C:/Users/chenx/phone-taxi-app
git remote set-url origin git@github.com:chenxs2000/phone-taxi-app.git
git push -u origin test-ci-cd
```

---

## 🔧 解决方案 5: 检查防火墙规则

### Windows Defender 防火墙

1. 打开 Windows 安全中心
2. 进入 防火墙和网络保护 → 高级设置
3. 点击 入站规则 → 新建规则
4. 配置：
   - 规则类型：端口
   - 协议：TCP
   - 特定本地端口：443
   - 操作：允许连接
   - 配置文件：域、专用、公用
   - 名称：允许 HTTPS 到 GitHub

### 杀毒软件

检查杀毒软件是否阻止了 Git：
- 将 Git 添加到白名单
- 临时禁用杀毒软件测试

### 公司网络

如果您在公司网络：
- 联系 IT 管理员
- 请求允许访问 github.com:443
- 或者使用公司提供的代理

---

## 🔧 解决方案 6: 检查网络设备

### 路由器/调制解调器

1. 登录路由器管理界面
2. 检查防火墙设置
3. 确认允许 HTTPS 连接

### VPN 或代理软件

- 如果使用 VPN，尝试关闭
- 如果使用代理软件，检查配置

---

## 📊 解决方案优先级

| 解决方案 | 优先级 | 成功率 | 时间 |
|---------|--------|--------|------|
| 清除 Git 代理 | ⭐⭐⭐⭐ | 高（如果有代理） | 1 分钟 |
| 切换到 SSH（22 端口） | ⭐⭐⭐⭐⭐ | 最高 | 10 分钟 |
| SSH over HTTPS（443） | ⭐⭐⭐⭐ | 高 | 5 分钟 |
| 检查防火墙 | ⭐⭐⭐ | 中 | 5 分钟 |
| 配置正确代理 | ⭐⭐ | 取决于代理 | 3 分钟 |

---

## 🎯 推荐执行步骤

### 步骤 1: 诊断网络（2 分钟）

```powershell
# 检查 Git 代理配置
git config --global --get http.proxy
git config --global --get https.proxy

# 测试 443 端口
Test-NetConnection -ComputerName github.com -Port 443

# 测试 22 端口
Test-NetConnection -ComputerName github.com -Port 22
```

**告诉我这三个命令的输出结果！**

### 步骤 2: 根据诊断结果选择方案

#### 情况 A: Git 配置了代理

执行解决方案 1：清除代理配置

#### 情况 B: 443 端口被阻止，22 端口可用

执行解决方案 3：使用 SSH（强烈推荐）

#### 情况 C: 443 和 22 端口都被阻止

执行解决方案 4：使用 SSH over HTTPS

---

## 📝 诊断命令输出解读

### Git 代理配置

**输出为空**：
- Git 没有配置代理
- 继续测试端口

**输出不为空**：
- Git 配置了代理
- 可能是代理不可用
- 尝试清除代理

### 端口测试

**TcpTestSucceeded : True**：
- 端口可用
- 可以使用这个协议

**TcpTestSucceeded : False**：
- 端口被阻止
- 需要使用其他方法

---

## 🚨 如果所有方法都失败

### 最后的手段

1. **更换网络环境**
   - 使用手机热点
   - 尝试其他 WiFi 网络

2. **使用 GitHub Desktop**
   - 下载：https://desktop.github.com
   - 使用图形界面推送

3. **手动上传工作流文件**
   - 在 GitHub 网页上手动创建 `.github/workflows/ci-cd.yml`
   - 至少可以触发 CI/CD

---

**文档版本**: 1.0.0
**创建时间**: 2026-03-03
