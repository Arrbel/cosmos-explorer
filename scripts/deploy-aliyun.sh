#!/bin/bash

# 阿里云 ECS Docker 部署脚本
# 使用方法: ./deploy-aliyun.sh [environment] [image_tag]

set -e

# 配置变量
ENVIRONMENT=${1:-production}
IMAGE_TAG=${2:-latest}
PROJECT_NAME="cosmos-explorer"
REGISTRY="registry.cn-hangzhou.aliyuncs.com"
NAMESPACE="your-namespace"
CONTAINER_NAME="${PROJECT_NAME}-${ENVIRONMENT}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
    fi
}

# 登录阿里云容器镜像服务
login_registry() {
    log "Logging into Aliyun Container Registry..."
    
    if [ -z "$ALIYUN_DOCKER_USERNAME" ] || [ -z "$ALIYUN_DOCKER_PASSWORD" ]; then
        error "ALIYUN_DOCKER_USERNAME and ALIYUN_DOCKER_PASSWORD must be set"
    fi
    
    echo "$ALIYUN_DOCKER_PASSWORD" | docker login "$REGISTRY" -u "$ALIYUN_DOCKER_USERNAME" --password-stdin
}

# 拉取镜像
pull_image() {
    local image_url="${REGISTRY}/${NAMESPACE}/${PROJECT_NAME}:${IMAGE_TAG}"
    log "Pulling image: $image_url"
    
    docker pull "$image_url" || error "Failed to pull image"
    docker tag "$image_url" "${PROJECT_NAME}:${IMAGE_TAG}"
}

# 备份当前容器
backup_current() {
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        log "Backing up current container..."
        docker commit "$CONTAINER_NAME" "${PROJECT_NAME}:backup-$(date +%Y%m%d-%H%M%S)" || warn "Failed to backup current container"
    fi
}

# 停止旧容器
stop_old_container() {
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        log "Stopping old container..."
        docker stop "$CONTAINER_NAME" || warn "Failed to stop old container"
        docker rm "$CONTAINER_NAME" || warn "Failed to remove old container"
    fi
}

# 启动新容器
start_new_container() {
    log "Starting new container..."
    
    local port_mapping=""
    case $ENVIRONMENT in
        "production")
            port_mapping="-p 80:80"
            ;;
        "staging")
            port_mapping="-p 8080:80"
            ;;
        "development")
            port_mapping="-p 3000:80"
            ;;
        *)
            error "Unknown environment: $ENVIRONMENT"
            ;;
    esac
    
    docker run -d \
        --name "$CONTAINER_NAME" \
        $port_mapping \
        --restart unless-stopped \
        --health-cmd="curl -f http://localhost/health || exit 1" \
        --health-interval=30s \
        --health-timeout=10s \
        --health-retries=3 \
        -e NODE_ENV="$ENVIRONMENT" \
        "${PROJECT_NAME}:${IMAGE_TAG}" || error "Failed to start new container"
}

# 健康检查
health_check() {
    log "Performing health check..."
    
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec "$CONTAINER_NAME" curl -f http://localhost/health &> /dev/null; then
            log "Health check passed!"
            return 0
        fi
        
        warn "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
}

# 清理旧镜像
cleanup() {
    log "Cleaning up old images..."
    docker image prune -f || warn "Failed to cleanup old images"
}

# 主函数
main() {
    log "Starting deployment of $PROJECT_NAME to $ENVIRONMENT environment with tag $IMAGE_TAG"
    
    check_docker
    login_registry
    pull_image
    backup_current
    stop_old_container
    start_new_container
    health_check
    cleanup
    
    log "Deployment completed successfully!"
    log "Container status:"
    docker ps -f name="$CONTAINER_NAME"
}

# 执行主函数
main "$@"
