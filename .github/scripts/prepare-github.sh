#!/bin/bash

# Phone Taxi App GitHub 准备和推送脚本
#
# 用途：帮助准备 GitHub 仓库、配置远程仓库并推送代码

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 颜色函数
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_success() {
    print_message "${GREEN}" "✓ $1"
}

print_error() {
    print_message "${RED}" "✗ $1"
}

print_info() {
    print_message "${BLUE}" "ℹ $1"
}

print_warning() {
    print_message "${YELLOW}" "⚠ $1"
}

# 显示帮助信息
show_help() {
    cat << EOF
Phone Taxi App GitHub 准备和推送脚本

用法: ./prepare-github.sh [选项]

选项:
    -r, --remote        配置 GitHub 远程仓库地址（必需）
    -u, --username        GitHub 用户名（必需）
    -o, --organization    GitHub 组织名（默认: phone-taxi-app）
    -c, --commit         创建初始提交（推荐）
    -p, --push           推送代码到 GitHub（推荐）
    -f, --force           强制覆盖（谨慎使用）
    -s, --status         显示状态
    -h, --help           显示此帮助信息

必需参数:
    -r, --remote        GitHub 远程仓库地址
    -u, --username        GitHub 用户名

示例:
    # 配置远程仓库并初始化
    ./prepare-github.sh -r https://github.com/your-username/phone-taxi-app.git -u your-username

    # 创建提交并推送
    ./prepare-github.sh -r https://github.com/your-username/phone-taxi-app.git -u your-username -c -p

    # 仅查看状态
    ./prepare-github.sh -s

注意:
- 脚本会自动检测当前 Git 仓库状态
- 首次运行建议使用 -c 选项创建提交
- 推送前建议使用 -s 选项检查状态

EOF
}

# 检查 Git 仓库状态
check_git_status() {
    if [ -d ".git" ]; then
        print_success "Git 仓库已初始化"
        return 0
    else
        print_info "Git 仓库未初始化"
        return 1
    fi
}

# 检查远程仓库配置
check_remote_configured() {
    if git remote get-url origin &>/dev/null; then
        local current_remote=$(git remote get-url origin)
        print_info "当前远程仓库: $current_remote"
        return 0
    else
        print_warning "远程仓库 'origin' 未配置"
        return 1
    fi
}

# 检查文件状态
check_files_committed() {
    local staged_files=$(git diff --name-only --cached)
    if [ -z "$staged_files" ]; then
        print_success "所有文件已是最新提交"
        return 0
    else
        print_info "以下文件未提交:"
        echo "$staged_files"
        return 1
    fi
}

# 配置 GitHub 远程仓库
setup_remote() {
    local remote_url=$1
    local username=$2

    print_info "配置远程仓库..."

    # 移除现有 origin（如果存在）
    git remote remove origin 2>/dev/null || true

    # 添加新的远程仓库
    git remote add origin "$remote_url"

    print_success "远程仓库已配置: $remote_url"
    print_info "GitHub 用户: $username"
}

# 创建初始提交
create_initial_commit() {
    print_info "创建初始提交..."

    # 添加所有文件
    git add .

    # 创建提交
    git commit -m "Initial commit: Phone Taxi App with CI/CD configuration

    print_success "初始提交已创建"
    print_info "提交哈希: $(git rev-parse HEAD)"
}

# 推送代码
push_to_github() {
    local branch=$1

    print_info "推送代码到 GitHub..."
    print_info "分支: $branch"

    if git push origin "$branch"; then
        print_success "代码推送成功！"
        print_info "GitHub Actions 将自动触发 CI/CD 流水线"

        # 显示 GitHub Actions 页面
        local username=$(git remote get-url origin | sed -n 's|https://github.com/\(.*\)/\1|' | head -1)
        local repo=$(basename "$username" .git)
        echo ""
        echo "🔗 GitHub Actions 页面:"
        echo "https://github.com/$username/phone-taxi-app/actions"
        echo ""
        echo "或使用 GitHub CLI 查看执行状态:"
        echo "gh run list"
    else
        print_error "代码推送失败"
        return 1
    fi
}

# 显示状态
show_status() {
    print_info "=== Git 仓库状态 ==="
    echo ""

    echo "📊 当前分支:"
    git branch --show-current 2>/dev/null || echo "HEAD (detached)"

    echo ""
    echo "📊 远程仓库:"
    git remote -v 2>/dev/null || echo "未配置"

    echo ""
    echo "📊 最近提交:"
    git log --oneline -5 2>/dev/null || echo "无提交"

    echo ""
    echo "📊 待提交文件:"
    local unstaged=$(git status --short 2>/dev/null)
    if [ ! -z "$unstaged" ]; then
        echo "$unstaged"
    fi

    echo ""
    echo "📊 CI/CD 文件状态:"
    echo "工作流文件: .github/workflows/ci-cd.yml"
    if [ -f ".github/workflows/ci-cd.yml" ]; then
        echo "✅ 已创建"
    else
        echo "❌ 未创建"
    fi
}

# 主函数
main() {
    local username=""
    local remote_url=""
    local do_setup=0
    local do_commit=0
    local do_push=0
    local do_status=0

    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -r|--remote)
                shift
                remote_url="$1"
                do_setup=1
                ;;
            -u|--username)
                shift
                username="$1"
                ;;
            -o|--organization)
                shift
                # 可以在远程 URL 中使用组织名
                ;;
            -c|--commit)
                shift
                do_commit=1
                ;;
            -p|--push)
                shift
                do_push=1
                ;;
            -f|--force)
                shift
                set -e
                ;;
            -s|--status)
                shift
                do_status=1
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
    if [ -z "$remote_url" ] && [ $do_setup -eq 0 ]; then
        print_error "必须指定远程仓库地址 (-r 或 --remote)"
        show_help
        exit 1
    fi

    if [ -z "$username" ] && [ $do_setup -eq 0 ]; then
        print_error "必须指定 GitHub 用户名 (-u 或 --username)"
        show_help
        exit 1
    fi

    print_info "GitHub 准备工具"
    print_info "远程仓库: $remote_url"
    print_info "GitHub 用户: $username"
    echo ""

    # 执行请求的操作
    if [ $do_setup -eq 1 ]; then
        setup_remote "$remote_url" "$username"
    elif [ $do_commit -eq 1 ]; then
        create_initial_commit
    elif [ $do_push -eq 1 ]; then
        check_files_committed
        if [ $? -eq 0 ]; then
            push_to_github "test-ci-cd"
        else
            print_warning "有未提交的文件，先提交或使用 -f 选项"
        fi
    elif [ $do_status -eq 1 ]; then
        show_status
    fi

    print_success "操作完成！"
    echo ""
    print_info "下一步："
    echo "  1. 检查 GitHub Actions 执行状态"
    echo "  2. 在 GitHub 配置必需的 Secrets（参考 .github/SECRETS-SETUP-GUIDE.md）"
    echo "  3. 监控首次 CI/CD 执行结果"
}
