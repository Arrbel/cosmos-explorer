#!/bin/bash

# 服务器环境一键安装脚本
# 适用于 Ubuntu 20.04/22.04 和 CentOS 8/9

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# 检测操作系统
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        error "无法检测操作系统版本"
    fi
    
    log "检测到操作系统: $OS $VER"
}

# 更新系统
update_system() {
    log "更新系统包..."
    
    if [[ $OS == *"Ubuntu"* ]]; then
        apt update && apt upgrade -y
        apt install -y curl wget git vim unzip htop net-tools
    elif [[ $OS == *"CentOS"* ]] || [[ $OS == *"Red Hat"* ]]; then
        yum update -y
        yum install -y curl wget git vim unzip htop net-tools
    else
        error "不支持的操作系统: $OS"
    fi
}

# 安装 Docker
install_docker() {
    log "安装 Docker..."
    
    # 检查是否已安装
    if command -v docker &> /dev/null; then
        warn "Docker 已安装，跳过安装步骤"
        return
    fi
    
    # 安装 Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # 启动 Docker 服务
    systemctl start docker
    systemctl enable docker
    
    # 添加当前用户到 docker 组
    usermod -aG docker $USER
    
    log "Docker 安装完成"
}

# 安装 Docker Compose
install_docker_compose() {
    log "安装 Docker Compose..."
    
    # 检查是否已安装
    if command -v docker-compose &> /dev/null; then
        warn "Docker Compose 已安装，跳过安装步骤"
        return
    fi
    
    # 获取最新版本号
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    
    # 下载并安装
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    log "Docker Compose 安装完成"
}

# 配置防火墙
configure_firewall() {
    log "配置防火墙..."
    
    if [[ $OS == *"Ubuntu"* ]]; then
        # Ubuntu 使用 ufw
        ufw --force enable
        ufw allow 22/tcp    # SSH
        ufw allow 80/tcp    # HTTP
        ufw allow 443/tcp   # HTTPS
        ufw allow 3000/tcp  # 开发端口
        ufw reload
    elif [[ $OS == *"CentOS"* ]] || [[ $OS == *"Red Hat"* ]]; then
        # CentOS 使用 firewalld
        systemctl start firewalld
        systemctl enable firewalld
        firewall-cmd --permanent --add-port=22/tcp
        firewall-cmd --permanent --add-port=80/tcp
        firewall-cmd --permanent --add-port=443/tcp
        firewall-cmd --permanent --add-port=3000/tcp
        firewall-cmd --reload
    fi
    
    log "防火墙配置完成"
}

# 创建项目目录
create_project_dirs() {
    log "创建项目目录..."
    
    mkdir -p /opt/cosmos-explorer/{logs,data,config,scripts,backups}
    chown -R $USER:$USER /opt/cosmos-explorer
    
    log "项目目录创建完成"
}

# 配置系统优化
optimize_system() {
    log "优化系统配置..."
    
    # 增加文件描述符限制
    echo "* soft nofile 65536" >> /etc/security/limits.conf
    echo "* hard nofile 65536" >> /etc/security/limits.conf
    
    # 优化内核参数
    cat >> /etc/sysctl.conf << EOF
# 网络优化
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# 内存优化
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# 文件系统优化
fs.file-max = 2097152
EOF
    
    sysctl -p
    
    log "系统优化完成"
}

# 安装监控工具
install_monitoring() {
    log "安装监控工具..."
    
    if [[ $OS == *"Ubuntu"* ]]; then
        apt install -y htop iotop nethogs ncdu
    elif [[ $OS == *"CentOS"* ]] || [[ $OS == *"Red Hat"* ]]; then
        yum install -y htop iotop nethogs ncdu
    fi
    
    log "监控工具安装完成"
}

# 创建有用的别名
create_aliases() {
    log "创建有用的别名..."
    
    cat >> ~/.bashrc << 'EOF'

# Docker 别名
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias dlog='docker logs'
alias dexec='docker exec -it'
alias dstop='docker stop'
alias drm='docker rm'
alias drmi='docker rmi'
alias dprune='docker system prune -f'

# 项目别名
alias cosmos='cd /opt/cosmos-explorer'
alias cosmos-logs='docker logs cosmos-explorer-prod -f'
alias cosmos-restart='docker restart cosmos-explorer-prod'
alias cosmos-status='docker ps | grep cosmos-explorer'

# 系统别名
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'
EOF
    
    log "别名创建完成"
}

# 验证安装
verify_installation() {
    log "验证安装..."
    
    info "检查 Docker 版本:"
    docker --version || error "Docker 安装失败"
    
    info "检查 Docker Compose 版本:"
    docker-compose --version || error "Docker Compose 安装失败"
    
    info "检查 Docker 服务状态:"
    systemctl is-active docker || error "Docker 服务未运行"
    
    info "测试 Docker 运行:"
    docker run --rm hello-world || error "Docker 运行测试失败"
    
    log "所有组件安装验证成功！"
}

# 显示后续步骤
show_next_steps() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🎉 服务器环境安装完成！${NC}"
    echo "=========================================="
    echo ""
    echo -e "${BLUE}下一步操作：${NC}"
    echo "1. 重新登录或执行: source ~/.bashrc"
    echo "2. 配置阿里云 ACR 登录:"
    echo "   docker login registry.cn-hangzhou.aliyuncs.com"
    echo ""
    echo "3. 克隆项目代码:"
    echo "   cd /opt/cosmos-explorer"
    echo "   git clone https://github.com/你的用户名/cosmos-explorer.git ."
    echo ""
    echo "4. 运行部署脚本:"
    echo "   ./scripts/deploy-aliyun.sh production latest"
    echo ""
    echo -e "${BLUE}有用的命令：${NC}"
    echo "- cosmos          # 进入项目目录"
    echo "- cosmos-logs     # 查看应用日志"
    echo "- cosmos-status   # 查看应用状态"
    echo "- dps             # 查看运行的容器"
    echo ""
    echo -e "${YELLOW}注意：请重新登录以使 Docker 组权限生效${NC}"
    echo "=========================================="
}

# 主函数
main() {
    echo "=========================================="
    echo -e "${GREEN}🚀 宇宙探索者项目 - 服务器环境安装${NC}"
    echo "=========================================="
    echo ""
    
    detect_os
    update_system
    install_docker
    install_docker_compose
    configure_firewall
    create_project_dirs
    optimize_system
    install_monitoring
    create_aliases
    verify_installation
    show_next_steps
}

# 执行主函数
main "$@"
