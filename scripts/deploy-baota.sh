#!/bin/bash

# 宝塔面板 Docker 部署脚本
# 适用于通过宝塔面板管理的服务器

set -e

# 配置变量
PROJECT_NAME="cosmos-explorer"
CONTAINER_NAME="cosmos-explorer-app"
PROJECT_DIR="/www/wwwroot/$PROJECT_NAME"
ENVIRONMENT="${1:-production}"
GIT_BRANCH="${2:-main}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# 显示横幅
show_banner() {
    echo ""
    echo -e "${BLUE}=========================================="
    echo -e "🌌 宇宙探索者 - 宝塔面板部署脚本"
    echo -e "=========================================="
    echo -e "环境: $ENVIRONMENT"
    echo -e "分支: $GIT_BRANCH"
    echo -e "时间: $(date)"
    echo -e "==========================================${NC}"
    echo ""
}

# 检查环境
check_environment() {
    log "检查部署环境..."
    
    # 检查 Docker 是否安装
    if ! command -v docker &> /dev/null; then
        error "Docker 未安装，请先在宝塔面板中安装 Docker"
    fi
    
    # 检查 Docker 服务是否运行
    if ! docker info &> /dev/null; then
        error "Docker 服务未运行，请启动 Docker 服务"
    fi
    
    # 检查 Git 是否安装
    if ! command -v git &> /dev/null; then
        error "Git 未安装，请先安装 Git"
    fi
    
    log "✅ 环境检查通过"
}

# 准备项目目录
prepare_project() {
    log "准备项目目录..."
    
    # 创建 wwwroot 目录（如果不存在）
    mkdir -p /www/wwwroot
    
    if [ ! -d "$PROJECT_DIR" ]; then
        info "首次部署，克隆项目..."
        cd /www/wwwroot
        
        # 提示用户输入 Git 仓库地址
        if [ -z "$GIT_REPO" ]; then
            read -p "请输入 Git 仓库地址: " GIT_REPO
        fi
        
        git clone "$GIT_REPO" "$PROJECT_NAME" || error "克隆项目失败"
        cd "$PROJECT_NAME"
    else
        info "项目目录已存在，拉取最新代码..."
        cd "$PROJECT_DIR"
        git fetch origin || error "拉取代码失败"
        git reset --hard "origin/$GIT_BRANCH" || error "重置代码失败"
    fi
    
    log "✅ 项目准备完成"
}

# 构建 Docker 镜像
build_image() {
    log "构建 Docker 镜像..."
    
    cd "$PROJECT_DIR"
    
    # 检查 Dockerfile 是否存在
    if [ ! -f "Dockerfile" ]; then
        error "Dockerfile 不存在，请确保项目包含 Dockerfile"
    fi
    
    # 根据环境设置镜像标签
    local image_tag
    case $ENVIRONMENT in
        "production")
            image_tag="latest"
            ;;
        "development")
            image_tag="dev"
            ;;
        "staging")
            image_tag="staging"
            ;;
        *)
            image_tag="$ENVIRONMENT"
            ;;
    esac
    
    # 构建镜像
    docker build -t "$PROJECT_NAME:$image_tag" . || error "镜像构建失败"
    
    log "✅ 镜像构建完成: $PROJECT_NAME:$image_tag"
}

# 停止旧容器
stop_old_container() {
    local container_name="$CONTAINER_NAME"
    
    if [ "$ENVIRONMENT" != "production" ]; then
        container_name="$CONTAINER_NAME-$ENVIRONMENT"
    fi
    
    log "停止旧容器: $container_name"
    
    if docker ps | grep -q "$container_name"; then
        docker stop "$container_name" || warn "停止容器失败"
    fi
    
    if docker ps -a | grep -q "$container_name"; then
        docker rm "$container_name" || warn "删除容器失败"
    fi
    
    log "✅ 旧容器已清理"
}

# 启动新容器
start_new_container() {
    log "启动新容器..."
    
    local container_name="$CONTAINER_NAME"
    local port_mapping="80:80"
    local image_tag="latest"
    
    # 根据环境调整配置
    case $ENVIRONMENT in
        "production")
            port_mapping="80:80"
            image_tag="latest"
            ;;
        "development")
            container_name="$CONTAINER_NAME-dev"
            port_mapping="3000:80"
            image_tag="dev"
            ;;
        "staging")
            container_name="$CONTAINER_NAME-staging"
            port_mapping="8080:80"
            image_tag="staging"
            ;;
    esac
    
    # 启动容器
    docker run -d \
        --name "$container_name" \
        -p "$port_mapping" \
        --restart unless-stopped \
        -e NODE_ENV="$ENVIRONMENT" \
        "$PROJECT_NAME:$image_tag" || error "容器启动失败"
    
    log "✅ 新容器已启动: $container_name"
    info "端口映射: $port_mapping"
}

# 健康检查
health_check() {
    log "执行健康检查..."
    
    local port
    case $ENVIRONMENT in
        "production")
            port="80"
            ;;
        "development")
            port="3000"
            ;;
        "staging")
            port="8080"
            ;;
        *)
            port="80"
            ;;
    esac
    
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f "http://localhost:$port/health" &> /dev/null; then
            log "✅ 健康检查通过！"
            return 0
        fi
        
        warn "健康检查失败，尝试 $attempt/$max_attempts..."
        sleep 5
        ((attempt++))
    done
    
    error "健康检查失败，部署可能有问题"
}

# 清理资源
cleanup() {
    log "清理旧资源..."
    
    # 清理悬空镜像
    docker image prune -f || warn "清理悬空镜像失败"
    
    # 清理旧的备份镜像（保留最近3个）
    local old_images=$(docker images "$PROJECT_NAME" --format "{{.Repository}}:{{.Tag}}" | grep -E "backup-[0-9]+" | tail -n +4)
    if [ ! -z "$old_images" ]; then
        echo "$old_images" | xargs docker rmi || warn "清理旧镜像失败"
    fi
    
    log "✅ 资源清理完成"
}

# 显示部署结果
show_result() {
    local port
    case $ENVIRONMENT in
        "production")
            port="80"
            ;;
        "development")
            port="3000"
            ;;
        "staging")
            port="8080"
            ;;
        *)
            port="80"
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo -e "🎉 部署完成！"
    echo -e "=========================================="
    echo -e "环境: $ENVIRONMENT"
    echo -e "访问地址: http://$(curl -s ifconfig.me):$port"
    echo -e "本地访问: http://localhost:$port"
    echo -e "=========================================="
    echo ""
    echo -e "${BLUE}📋 后续操作：${NC}"
    echo -e "1. 在宝塔面板 → Docker → 容器管理 中查看容器状态"
    echo -e "2. 查看容器日志: docker logs $CONTAINER_NAME-$ENVIRONMENT -f"
    echo -e "3. 进入容器: docker exec -it $CONTAINER_NAME-$ENVIRONMENT sh"
    echo -e "4. 重启容器: docker restart $CONTAINER_NAME-$ENVIRONMENT"
    echo -e "${GREEN}==========================================${NC}"
}

# 备份当前镜像
backup_current_image() {
    log "备份当前镜像..."
    
    local current_image="$PROJECT_NAME:latest"
    local backup_tag="backup-$(date +%Y%m%d-%H%M%S)"
    
    if docker images | grep -q "$PROJECT_NAME.*latest"; then
        docker tag "$current_image" "$PROJECT_NAME:$backup_tag" || warn "备份镜像失败"
        log "✅ 当前镜像已备份为: $PROJECT_NAME:$backup_tag"
    fi
}

# 显示使用帮助
show_help() {
    echo "宝塔面板 Docker 部署脚本"
    echo ""
    echo "用法: $0 [环境] [分支]"
    echo ""
    echo "参数:"
    echo "  环境    部署环境 (production|development|staging，默认: production)"
    echo "  分支    Git 分支 (默认: main)"
    echo ""
    echo "示例:"
    echo "  $0                          # 部署到生产环境 (main 分支)"
    echo "  $0 development develop      # 部署到开发环境 (develop 分支)"
    echo "  $0 staging staging          # 部署到测试环境 (staging 分支)"
    echo ""
    echo "环境变量:"
    echo "  GIT_REPO    Git 仓库地址 (首次部署时需要)"
}

# 主函数
main() {
    case "$1" in
        "help"|"--help"|"-h")
            show_help
            exit 0
            ;;
    esac
    
    show_banner
    check_environment
    prepare_project
    
    if [ "$ENVIRONMENT" = "production" ]; then
        backup_current_image
    fi
    
    build_image
    stop_old_container
    start_new_container
    health_check
    cleanup
    show_result
}

# 执行主函数
main "$@"
