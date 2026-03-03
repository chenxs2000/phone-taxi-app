#!/bin/bash

# Phone Taxi App - 自动化推送脚本（使用 PAT）
#
# 用途：使用 PAT 自动配置凭据并推送代码到 GitHub

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 显示帮助
show_help() {
    cat << EOF
Phone Taxi App - 自动化推送脚本

用法: ./auto-push-with-token.sh [选项]

选项:
    -t, --token <token>    GitHub Personal Access Token（必需）
    -b, --branch <name>   分支名称（默认: test-ci-cd）
    -f, --force           强制推送
    -h, --help           显示此帮助信息

必需的 PAT 权限:
    - repo (全部子选项)
    - workflow
    - write:packages

示例:
    # 使用 Token 推送
    ./auto-push-with-token.sh -t YOUR_PAT_TOKEN

    # 强制推送
    ./auto-push-with-token.sh -t YOUR_PAT_TOKEN -f

    # 推送到指定分支
    ./auto-push-with-token.sh -t YOUR_PAT_TOKEN -b main

注意:
    - Token 只用于配置凭据，不会被保存到代码中
    - 凭据会被安全地存储在 Git 的凭据存储中
    - 使用后建议删除临时文件

EOF
}

# 配置 Git 凭据
configure_credentials() {
    local token=$1
    local username=$2

    print_info "配置 Git 凭据..."

    # 创建凭据存储 URL
    local cred_url="https://${username}:${token}@github.com"

    # 配置 Git 凭据 helper
    git config --local credential.helper store

    # 保存凭据
    echo "url=https://github.com
    username=${username}
    password=${token}
    " | git credential-store --file ~/.git-credentials store

    print_success "Git 凭据已配置"
}

# 推送代码
push_code() {
    local branch=$1
    local force=$2

    print_info "推送代码到 GitHub..."
    print_info "分支: $branch"

    if [ "$force" = "true" ]; then
        print_warning "使用强制推送..."
        if git push -f origin "$branch"; then
            print_success "代码推送成功（强制推送）！"
            print_info "GitHub Actions CI/CD 流水线已触发"
            print_info "Actions 页面: https://github.com/chenxs2000/phone-taxi-app/actions"
            return 0
        else
            print_error "代码推送失败"
            return 1
        fi
    else
        if git push origin "$branch"; then
            print_success "代码推送成功！"
            print_info "GitHub Actions CI/CD 流水线已触发"
            print_info "Actions 页面: https://github.com/chenxs2000/phone-taxi-app/actions"
            return 0
        else
            print_error "代码推送失败"
            print_info "尝试使用强制推送: -f"
            return 1
        fi
    fi
}

# 清理凭据
cleanup_credentials() {
    print_info "清理凭据..."

    # 移除凭据存储
    if [ -f ~/.git-credentials ]; then
        rm ~/.git-credentials
        print_success "凭据存储已清理"
    fi

    # 移除临时 token 文件（如果有）
    if [ -f .token ]; then
        rm .token
        print_success "临时 Token 文件已删除"
    fi
}

# 主函数
main() {
    local token=""
    local branch="test-ci-cd"
    local username="chenxs2000"
    local force="false"

    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -t|--token)
                token="$2"
                shift 2
                ;;
            -b|--branch)
                branch="$2"
                shift 2
                ;;
            -f|--force)
                force="true"
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # 检查必需参数
    if [ -z "$token" ]; then
        print_error "必须提供 Token (-t 或 --token)"
        show_help
        exit 1
    fi

    print_info "自动化推送工具"
    print_info "用户: $username"
    print_info "分支: $branch"
    print_info "强制推送: $force"
    echo ""

    # 配置凭据
    configure_credentials "$token" "$username"
    echo ""

    # 推送代码
    if push_code "$branch" "$force"; then
        echo ""
        print_success "推送完成！"
        echo ""

        # 清理凭据
        cleanup_credentials
        echo ""

        print_info "下一步："
        echo "  1. 访问 GitHub Actions 页面查看 CI/CD 执行状态"
        echo "  2. Actions 页面: https://github.com/chenxs2000/phone-taxi-app/actions"
        echo "  3. 参考 .github/CI-CD-MONITORING-GUIDE.md 监控执行"
    else
        echo ""
        print_error "推送失败"
        echo ""
        print_info "可能的原因："
        echo "  - Token 权限不足（需要 repo + workflow + write:packages）"
        echo "  - 网络连接问题"
        echo "  - 远程仓库配置错误"
        echo ""
        print_info "请检查 Token 权限后重试"
        exit 1
    fi
}

main "$@"
