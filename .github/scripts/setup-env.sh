#!/bin/bash

# Phone Taxi App 环境配置脚本
#
# 用途：为所有微服务创建 .env.staging 和 .env.production 配置文件

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 基础路径
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICES_DIR="$BASE_DIR/services"

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
Phone Taxi App 环境配置脚本

用法: ./setup-env.sh [选项] [环境]

选项:
    -h, --help           显示此帮助信息
    -e, --environment    目标环境 (staging|production)
    -s, --service         指定服务 (all|api-gateway|user-service|...)
    -f, --force          覆盖现有配置文件
    -t, --template       仅生成模板文件

环境:
    staging              生成测试环境配置
    production           生成生产环境配置

示例:
    ./setup-env.sh staging
    ./setup-env.sh production -s api-gateway
    ./setup-env.sh staging -t

EOF
}

# 创建测试环境配置
create_staging_env() {
    local service=$1
    local config_file="$SERVICES_DIR/$service/.env.staging"
    local service_name=$(basename $service)

    print_info "创建测试环境配置: $config_file"

    cat > "$config_file" << EOF
# $service_name - 测试环境配置
# Phone Taxi App - Staging Environment Configuration

# ============== API 配置 ==============
API_GATEWAY_URL=http://localhost:3000/api

# ============== 应用配置 ==============
NODE_ENV=staging
LOG_LEVEL=debug

# ============== JWT 配置 ==============
JWT_SECRET=staging-test-secret-key-do-not-use-in-production
JWT_EXPIRES_IN=7d

# ============== 服务 URL 配置 ==============
$service_name.toUpperCase()_SERVICE_URL=http://localhost:$([[ "$service_name" == "api-gateway" ]] && echo "3000" || [[ "$service_name" == "user-service" ]] && echo "3001" || [[ "$service_name" == "order-service" ]] && echo "3002" || [[ "$service_name" == "dispatch-service" ]] && echo "3003" || [[ "$service_name" == "payment-service" ]] && echo "3004" || [[ "$service_name" == "notification-service" ]] && echo "3005" || [[ "$service_name" == "statistics-service" ]] && echo "3006" || [[ "$service_name" == "call-service" ]] && echo "3007")

# ============== 数据库配置 ==============
# MongoDB 配置（使用本地开发数据库）
MONGODB_URI=mongodb://admin:password123@localhost:27017/phone-taxi-staging?authSource=admin

# Redis 配置
REDIS_URI=redis://localhost:6379

# RabbitMQ 配置
RABBITMQ_URI=amqp://admin:password@localhost:5672

# ============== 其他配置 ==============
DEPLOYMENT_ENV=staging
DEPLOYMENT_VERSION=\$(date +%Y.%m.%d)-local
DEPLOYMENT_TIMESTAMP=\$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

    print_success "测试环境配置已创建: $config_file"
}

# 创建生产环境配置模板
create_production_env() {
    local service=$1
    local config_file="$SERVICES_DIR/$service/.env.production.example"
    local service_name=$(basename $service)

    print_info "创建生产环境配置模板: $config_file"

    cat > "$config_file" << EOF
# $service_name - 生产环境配置示例
# Phone Taxi App - Production Environment Configuration Example
# ⚠️ 重要：复制此文件为 .env.production 并填入真实的配置值

# ============== API 配置 ==============
API_GATEWAY_URL=https://api.phone-taxi.app/api

# ============== 应用配置 ==============
NODE_ENV=production
LOG_LEVEL=info

# ============== JWT 配置 ==============
# ⚠️ 重要：使用强随机密钥，至少 32 位字符
JWT_SECRET=\${PROD_JWT_SECRET_PLACEHOLDER}
JWT_EXPIRES_IN=7d

# ============== 服务 URL 配置 ==============
# 生产环境使用实际的生产服务端点
$service_name.toUpperCase()_SERVICE_URL=http://$service_name.production.internal:3000

# ============== 数据库配置 ==============
# MongoDB 生产配置（使用副本集和认证）
# 格式: mongodb://username:password@host:port/database?authSource=admin
MONGODB_URI=\${PROD_MONGODB_URI_PLACEHOLDER}

# Redis 生产配置（使用密码）
REDIS_URI=redis://\${PROD_REDIS_PASSWORD_PLACEHOLDER}@prod-redis.internal:6379

# RabbitMQ 生产配置（使用强密码）
RABBITMQ_URI=amqp://\${PROD_RABBITMQ_USER}:\${PROD_RABBITMQ_PASSWORD}@prod-rabbitmq.internal:5672

# ============== 其他配置 ==============
DEPLOYMENT_ENV=production
DEPLOYMENT_VERSION=\${PROD_DEPLOYMENT_VERSION_PLACEHOLDER}
DEPLOYMENT_TIMESTAMP=\${PROD_DEPLOYMENT_TIMESTAMP_PLACEHOLDER}

# ============== 监控配置 ==============
PROMETHEUS_ENDPOINT=http://prometheus.monitoring.internal:9090/metrics
GRAFANA_DASHBOARD=https://grafana.monitoring.internal
SENTRY_DSN=\${PROD_SENTRY_DSN_PLACEHOLDER}

# ============== 安全配置 ==============
HTTPS_ENABLED=true

# ============== 功能标志 ==============
FEATURE_RATE_LIMIT_ENABLED=true
FEATURE_CACHING_ENABLED=true
FEATURE_LOGGING_ENABLED=true
EOF

    print_success "生产环境配置模板已创建: $config_file"
    print_warning "请编辑配置文件并填入真实的生产配置"
}

# 创建所有服务的配置
create_all_envs() {
    local env=$1
    local force=${FORCE:-false}

    print_info "为 $env 环境创建配置..."

    # 服务列表
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

    for service in "${services[@]}"; do
        local config_file="$SERVICES_DIR/$service/.env.$env"

        # 检查文件是否存在
        if [ -f "$config_file" ] && [ "$force" != "true" ]; then
            print_warning "配置文件已存在: $config_file"
            print_info "使用 -f 选项覆盖"
        else
            if [ "$env" == "staging" ]; then
                create_staging_env "$service"
            else
                create_production_env "$service"
            fi
        fi
    done

    print_success "所有服务配置已创建"
}

# 主函数
main() {
    local env=""
    local service=""
    local force="false"

    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_help
                exit 0
                ;;
            -e|--environment)
                shift
                env="$1"
                ;;
            -s|--service)
                shift
                service="$1"
                ;;
            -f|--force)
                shift
                force="true"
                ;;
            *)
                echo "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # 验证环境参数
    if [ -z "$env" ]; then
        print_error "必须指定环境: staging 或 production"
        show_help
        exit 1
    fi

    case "$env" in
        staging|production)
            print_info "目标环境: $env"
            ;;
        *)
            print_error "无效的环境: $env"
            echo "有效环境: staging, production"
            exit 1
            ;;
    esac

    # 执行配置
    if [ -n "$service" ]; then
        # 为指定服务创建配置
        if [ "$env" == "staging" ]; then
            create_staging_env "$service"
        else
            create_production_env "$service"
        fi
    else
        # 为所有服务创建配置
        create_all_envs "$env"
    fi

    print_success "环境配置完成！"
    print_info "请查看生成的配置文件并根据需要修改配置值"
    echo ""
    print_info "下一步："
    echo "  1. 配置 GitHub Secrets（参考 .github/SECRETS-SETUP-GUIDE.md）"
    echo "  2. 提交配置文件到 Git"
    echo "  3. 推送并测试 CI/CD 流水线"
}

# 运行主函数
main "$@"
