#!/bin/bash

# Phone Taxi App - 交互式推送脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info "======================================="
print_info "Phone Taxi App - 交互式推送工具"
print_info "======================================="
echo ""

print_info "请按照以下步骤操作："
echo ""
print_warning "步骤 1: 创建 GitHub Personal Access Token"
echo ""
print_info "1. 访问: https://github.com/settings/tokens"
echo "2. 点击 'Generate new token (classic)'"
echo "3. 配置:"
echo "   - Note: Phone Taxi App Full Access"
echo "   - Expiration: 90 days"
echo "   - 权限:"
echo "     ✅ repo (全部)"
echo "     ✅ workflow"
echo "     ✅ write:packages"
echo "4. 复制 Token（只显示一次）"
echo ""

# 读取 Token
read -sp "请输入您的 PAT（输入时不会显示）: " TOKEN
echo ""
echo ""

if [ -z "$TOKEN" ]; then
    print_error "Token 不能为空"
    exit 1
fi

print_success "Token 已接收"
echo ""

# 配置凭据
print_info "配置 Git 凭据..."
git config --local credential.helper store

USERNAME="chenxs2000"
BRANCH="test-ci-cd"

print_info "用户: $USERNAME"
print_info "分支: $BRANCH"
echo ""

# 使用 credential store
echo "url=https://github.com
username=${USERNAME}
password=${TOKEN}" | git credential-store --file ~/.git-credentials store

print_success "凭据已配置"
echo ""

# 推送
print_info "推送代码到 GitHub..."
print_warning "使用强制推送（-f）..."
echo ""

if git push -f origin "$BRANCH"; then
    echo ""
    print_success "推送成功！"
    echo ""

    print_info "GitHub Actions 页面:"
    echo "https://github.com/chenxs2000/phone-taxi-app/actions"
    echo ""

    print_info "参考监控指南:"
    echo ".github/CI-CD-MONITORING-GUIDE.md"
    echo ""

    # 清理
    print_info "清理凭据存储..."
    rm -f ~/.git-credentials
    print_success "凭据已清理"
else
    echo ""
    print_error "推送失败"
    echo ""
    print_info "请检查:"
    echo "  1. Token 权限是否正确（repo + workflow + write:packages）"
    echo "  2. Token 是否已复制完整"
    echo "  3. 网络连接是否正常"
    echo ""
    exit 1
fi
