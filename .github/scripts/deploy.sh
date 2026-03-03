#!/bin/bash

# Phone Taxi App 部署脚本
#
# 用途：自动化部署到指定环境
# 使用方法：./deploy.sh [staging|production]

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
DEPLOYMENT_ENV="${1:-staging}"
APP_NAME="phone-taxi-app"
REGISTRY="ghcr.io/phone-taxi-app"
DEPLOY_TIMEOUT=300

# 函数：打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 函数：打印成功消息
print_success() {
    print_message "${GREEN}" "✓ $1"
}

# 函数：打印错误消息
print_error() {
    print_message "${RED}" "✗ $1"
}

# 函数：打印警告消息
print_warning() {
    print_message "${YELLOW}" "⚠ $1"
}

# 函数：打印信息消息
print_info() {
    print_message "${BLUE}" "ℹ $1"
}

# 函数：显示帮助信息
show_help() {
    cat << EOF
Phone Taxi App 部署脚本

用法: ./deploy.sh [选项] [环境]

选项:
    -h, --help           显示此帮助信息
    -e, --environment    部署环境 (staging|production)
    -s, --service         指定服务名称 (all|user-service|order-service|...)
    -v, --version         应用版本 (默认: latest)
    -f, --force           强制部署，跳过健康检查
    -r, --rollback        回滚到上一个版本

环境:
    staging              部署到测试环境
    production           部署到生产环境

示例:
    ./deploy.sh staging
    ./deploy.sh -e production
    ./deploy.sh -s api-gateway -e production
    ./deploy.sh -e production -f --rollback

EOF
}

# 函数：检查环境变量
check_environment() {
    if [ -z "$DEPLOYMENT_ENV" ]; then
        print_error "部署环境未指定"
        echo "用法: $0 [staging|production]"
        exit 1
    fi

    case "$DEPLOYMENT_ENV" in
        staging|production)
            print_info "部署环境: $DEPLOYMENT_ENV"
            ;;
        *)
            print_error "无效的环境: $DEPLOYMENT_ENV"
            echo "有效环境: staging, production"
            exit 1
            ;;
    esac

    # 检查必要的环境变量
    if [ -z "$KUBECONFIG" ] && [ -z "$DOCKER_COMPOSE_FILE" ]; then
        print_error "未设置 KUBECONFIG 或 DOCKER_COMPOSE_FILE"
        exit 1
    fi
}

# 函数：检查 Docker 镜像
check_docker_image() {
    local service=$1
    local image="${REGISTRY}/${service}:${APP_VERSION}"

    print_info "检查 Docker 镜像: $image"

    if docker manifest inspect "$image" > /dev/null 2>&1; then
        print_success "镜像存在: $image"
        return 0
    else
        print_error "镜像不存在: $image"
        return 1
    fi
}

# 函数：拉取最新镜像
pull_image() {
    local service=$1
    local image="${REGISTRY}/${service}:${APP_VERSION}"

    print_info "拉取镜像: $image"
    if docker pull "$image"; then
        print_success "镜像拉取成功"
    else
        print_error "镜像拉取失败"
        exit 1
    fi
}

# 函数：停止现有服务
stop_service() {
    local service=$1
    local container_name="phone-taxi-${service}"

    print_info "停止现有服务: $container_name"

    # 检查容器是否存在
    if docker ps -q -f name="${container_name}"; then
        print_info "容器正在运行，正在停止..."
        docker stop "${container_name}" --timeout ${DEPLOY_TIMEOUT}
        print_success "服务已停止"
    else
        print_info "容器未运行"
    fi
}

# 函数：删除旧容器
remove_container() {
    local service=$1
    local container_name="phone-taxi-${service}"

    print_info "删除旧容器: $container_name"

    if docker ps -a -q -f name="${container_name}"; then
        docker rm "${container_name}" -f
        print_success "旧容器已删除"
    fi
}

# 函数：启动服务
start_service() {
    local service=$1
    local container_name="phone-taxi-${service}"
    local image="${REGISTRY}/${service}:${APP_VERSION}"
    local env_file="services/${service}/.env.${DEPLOYMENT_ENV}"

    print_info "启动服务: $container_name"

    # 构建环境变量
    local env_vars=""
    if [ -f "$env_file" ]; then
        env_vars="--env-file $env_file"
        print_info "使用环境文件: $env_file"
    fi

    # 启动容器
    if docker run -d \
        --name "${container_name}" \
        --network phone-taxi-network \
        --restart unless-stopped \
        --health-cmd "curl -f http://localhost:${SERVICE_PORT:-3000}/health || exit 1" \
        --health-interval 10s \
        --health-timeout 30s \
        --health-retries 3 \
        $env_vars \
        "${image}" > /dev/null 2>&1; then

        print_success "服务启动成功"
        echo "容器 ID: $(docker ps -q -f name="${container_name}")"
    else
        print_error "服务启动失败"
        exit 1
    fi
}

# 函数：健康检查
health_check() {
    local service=$1
    local url="${DEPLOYMENT_URL}/${service}/health"
    local max_retries=30
    local retry_interval=2

    print_info "执行健康检查: $url"

    for ((i=1; i<=max_retries; i++)); do
        if curl -f -s --max-time 3 "$url" > /dev/null 2>&1; then
            print_success "健康检查通过 (尝试 $i/$max_retries)"
            return 0
        fi

        if [ $((i % 5)) -eq 0 ]; then
            print_warning "健康检查重试中... ($i/$max_retries)"
        fi

        sleep "$retry_interval"
    done

    print_error "健康检查超时"
    return 1
}

# 函数：获取当前版本
get_current_version() {
    if docker ps -q -f name="phone-taxi-${SERVICE_NAME}"; then
        local version=$(docker inspect --format='{{.Config.Image}}' phone-taxi-${SERVICE_NAME} | grep -oP ':[^:]*$' | sed 's/://')
        echo "$version"
    else
        echo "none"
    fi
}

# 函数：记录部署
log_deployment() {
    local service=$1
    local status=$2
    local version="${APP_VERSION}"
    local timestamp=$(date -u +%Y-%m-%d_%H:%M:%S)

    print_info "记录部署信息..."

    # 这里可以添加到部署日志数据库
    # 或发送到监控系统
    cat << EOF
部署日志:
----------
服务: ${service}
环境: ${DEPLOYMENT_ENV}
版本: ${version}
状态: ${status}
时间: ${timestamp}
执行者: ${USER}
触发器: ${GITHUB_RUN_ID:-manual}
----------
EOF
}

# 函数：回滚部署
rollback_deployment() {
    local service=$1
    local current_version=$(get_current_version)

    if [ "$current_version" = "none" ]; then
        print_error "没有运行的实例可回滚"
        exit 1
    fi

    print_warning "回滚到上一版本..."

    # 这里可以实现回滚逻辑
    # 例如：从备份恢复，或拉取上一个版本的镜像
}

# 函数：部署所有服务
deploy_all_services() {
    print_info "开始部署所有服务..."

    local services=(
        "api-gateway"
        "user-service"
        "order-service"
        "dispatch-service"
        "payment-service"
        "notification-service"
        "statistics-service"
        "call-service"
    )

    local failed_services=()

    for service in "${services[@]}"; do
        echo ""
        print_info "========== 部署 $service =========="

        if check_docker_image "$service" && pull_image "$service"; then
            stop_service "$service"
            remove_container "$service"
            start_service "$service"

            # 等待服务启动
            sleep 5

            if health_check "$service"; then
                log_deployment "$service" "success"
            else
                failed_services+=("$service")
                log_deployment "$service" "failed"
            fi
        else
            failed_services+=("$service")
            log_deployment "$service" "failed"
        fi
    done

    # 显示部署摘要
    echo ""
    print_info "========== 部署摘要 =========="
    print_success "成功部署: $((${#services[@]} - ${#failed_services[@]}) 个服务"

    if [ ${#failed_services[@]} -gt 0 ]; then
        print_error "部署失败: ${#failed_services[@]} 个服务"
        echo "失败的服务:"
        printf '  - %s\n' "${failed_services[@]}"
        exit 1
    fi
}

# 函数：清理未使用的镜像
cleanup_images() {
    print_info "清理未使用的 Docker 镜像..."
    docker image prune -f --filter "label=app=${APP_NAME}"
}

# 主函数
main() {
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_help
                exit 0
                ;;
            -e|--environment)
                shift
                DEPLOYMENT_ENV="$1"
                shift
                ;;
            -s|--service)
                shift
                SERVICE_NAME="$1"
                shift
                ;;
            -v|--version)
                shift
                APP_VERSION="$1"
                shift
                ;;
            -f|--force)
                FORCE_DEPLOY=true
                shift
                ;;
            -r|--rollback)
                ROLLBACK=true
                shift
                ;;
            *)
                echo "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # 检查环境
    check_environment

    # 设置部署URL
    case "$DEPLOYMENT_ENV" in
        staging)
            DEPLOYMENT_URL="https://staging.phone-taxi.app"
            ;;
        production)
            DEPLOYMENT_URL="https://api.phone-taxi.app"
            ;;
    esac

    print_info "部署环境: $DEPLOYMENT_ENV"
    print_info "应用版本: ${APP_VERSION:-latest}"
    print_info "部署URL: ${DEPLOYMENT_URL}"

    # 检查是否回滚
    if [ "$ROLLBACK" = true ]; then
        if [ -n "$SERVICE_NAME" ]; then
            rollback_deployment "$SERVICE_NAME"
        else
            print_error "回滚需要指定服务名称 (-s)"
            exit 1
        fi
        exit 0
    fi

    # 部署逻辑
    if [ -n "$SERVICE_NAME" ]; then
        # 部署单个服务
        if ! check_docker_image "$SERVICE_NAME" || [ "$FORCE_DEPLOY" = true ]; then
            pull_image "$SERVICE_NAME"
        fi
        stop_service "$SERVICE_NAME"
        remove_container "$SERVICE_NAME"
        start_service "$SERVICE_NAME"

        if [ "$FORCE_DEPLOY" != true ]; then
            health_check "$SERVICE_NAME"
        fi

        log_deployment "$SERVICE_NAME" "success"
    else
        # 部署所有服务
        deploy_all_services
    fi

    # 清理
    if [ $? -eq 0 ]; then
        cleanup_images
    fi

    print_success "部署完成！"
}

# 运行主函数
main "$@"
