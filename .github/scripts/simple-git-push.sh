#!/bin/bash

# Phone Taxi App 简化的 Git 推送脚本
#
# 用途：简化的 Git 仓库配置和代码推送

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 显示帮助
show_help() {
    cat << 'EOF'
Phone Taxi App - Git 推送脚本

用法: ./simple-git-push.sh [操作] [参数]

操作:
    init         初始化 Git 仓库
    status        查看当前状态
    add-remote     配置远程仓库
    commit       创建初始提交
    push          推送代码到 GitHub

参数:
    -r, --remote <url>    设置远程仓库地址（必需）
    -u, --username <user>  设置 GitHub 用户名（必需）
    -b, --branch <name>  切换/创建分支

示例:
    # 1. 初始化
    ./simple-git-push.sh init

    # 2. 配置远程仓库（替换 YOUR_USERNAME）
    ./simple-git-push.sh add-remote -r https://github.com/YOUR_USERNAME/phone-taxi-app.git -u YOUR_USERNAME

    # 3. 创建初始提交
    ./simple-git-push.sh commit

    # 4. 推送到 GitHub
    ./simple-git-push.sh push

    # 5. 查看状态
    ./simple-git-push.sh status

注意:
- 脚本会自动检测当前环境
- 请确保已创建 GitHub 仓库并配置了 Secrets

EOF
}

# 初始化 Git
do_init() {
    if [ -d .git ]; then
        print_error ".git 目录已存在"
        return 1
    fi

    print_info "初始化 Git 仓库..."
    git init
    print_success "Git 仓库已初始化"
}

# 添加远程仓库
do_add_remote() {
    local remote_url=$1
    local username=$2

    print_info "添加远程仓库: $remote_url"

    # 移除现有的 origin（如果有）
    git remote remove origin 2>/dev/null || true

    # 添加新的远程仓库
    git remote add origin "$remote_url"

    print_success "远程仓库已配置: $remote_url"
    print_info "用户: $username"
}

# 创建初始提交
do_commit() {
    print_info "创建初始提交..."

    git add .

    local commit_message="Initial commit: Phone Taxi App with CI/CD configuration"
    git commit -m "$commit_message"

    print_success "初始提交已创建"
    git log -1 --oneline
}

# 推送代码
do_push() {
    local branch=$1

    print_info "推送代码到 GitHub..."
    print_info "分支: $branch"

    if git push origin "$branch"; then
        print_success "代码推送成功！"
        print_info "GitHub Actions CI/CD 流水线已触发"
        print_info "Actions 页面: https://github.com/YOUR_USERNAME/phone-taxi-app/actions"
    else
        print_error "代码推送失败"
        return 1
    fi
}

# 显示状态
do_status() {
    print_info "=== Git 仓库状态 ==="
    echo ""

    print_info "当前分支:"
    local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "HEAD (detached)")
    echo "  $current_branch"

    echo ""
    print_info "远程仓库:"
    local remote_info=$(git remote -v 2>/dev/null)
    if [ -z "$remote_info" ]; then
        echo "  未配置"
    else
        echo "$remote_info"
    fi

    echo ""
    print_info "最近提交:"
    local commits=$(git log --oneline -3 2>/dev/null || echo "无提交")
    if [ -z "$commits" ]; then
        echo "  无提交"
    else
        echo "$commits"
    fi
}

# 主函数
main() {
    local action=""
    local remote_url=""
    local username=""

    while [[ $# -gt 0 ]]; do
        case "$1" in
            init)
                action="init"
                shift
                ;;
            status)
                action="status"
                shift
                ;;
            add-remote)
                shift
                if [ -n "$2" ]; then
                    remote_url="$2"
                    shift
                fi
                if [ -n "$3" ]; then
                    username="$3"
                    shift
                fi
                ;;
            commit)
                action="commit"
                shift
                ;;
            push)
                action="push"
                shift
                ;;
            *)
                echo "未知操作: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # 执行操作
    case "$action" in
        init)
            do_init
            ;;
        status)
            do_status
            ;;
        add-remote)
            do_add_remote "$remote_url" "$username"
            ;;
        commit)
            do_commit
            ;;
        push)
            if [ -n "$1" ]; then
                do_push "$1"
            else
                print_error "推送需要指定分支名称"
                show_help
                exit 1
            fi
            ;;
        *)
            echo "无操作指定，显示帮助"
            show_help
            ;;
    esac
}
