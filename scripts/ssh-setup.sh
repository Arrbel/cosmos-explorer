#!/bin/bash

# SSH 密钥配置脚本
# 用于快速配置 SSH 密钥对，简化服务器连接

set -e

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

# 生成 SSH 密钥对
generate_ssh_key() {
    local email="$1"
    local key_name="${2:-cosmos-explorer}"
    
    if [ -z "$email" ]; then
        read -p "请输入你的邮箱地址: " email
    fi
    
    log "生成 SSH 密钥对..."
    
    # 创建 .ssh 目录
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    
    # 生成密钥对
    ssh-keygen -t rsa -b 4096 -C "$email" -f ~/.ssh/$key_name -N ""
    
    log "SSH 密钥对生成完成:"
    info "私钥: ~/.ssh/$key_name"
    info "公钥: ~/.ssh/$key_name.pub"
}

# 显示公钥内容
show_public_key() {
    local key_name="${1:-cosmos-explorer}"
    local pub_key_file="$HOME/.ssh/$key_name.pub"
    
    if [ ! -f "$pub_key_file" ]; then
        error "公钥文件不存在: $pub_key_file"
    fi
    
    echo ""
    echo "=========================================="
    echo -e "${GREEN}📋 公钥内容 (需要添加到服务器)${NC}"
    echo "=========================================="
    cat "$pub_key_file"
    echo "=========================================="
    echo ""
}

# 显示私钥内容
show_private_key() {
    local key_name="${1:-cosmos-explorer}"
    local priv_key_file="$HOME/.ssh/$key_name"
    
    if [ ! -f "$priv_key_file" ]; then
        error "私钥文件不存在: $priv_key_file"
    fi
    
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🔐 私钥内容 (需要添加到 GitHub Secrets)${NC}"
    echo "=========================================="
    cat "$priv_key_file"
    echo "=========================================="
    echo ""
}

# 配置服务器公钥
setup_server_key() {
    local server_ip="$1"
    local username="${2:-root}"
    local key_name="${3:-cosmos-explorer}"
    local pub_key_file="$HOME/.ssh/$key_name.pub"
    
    if [ -z "$server_ip" ]; then
        read -p "请输入服务器 IP 地址: " server_ip
    fi
    
    if [ ! -f "$pub_key_file" ]; then
        error "公钥文件不存在: $pub_key_file"
    fi
    
    log "配置服务器公钥..."
    
    # 复制公钥到服务器
    ssh-copy-id -i "$pub_key_file" "$username@$server_ip" || {
        warn "ssh-copy-id 失败，尝试手动配置..."
        
        # 手动配置
        cat "$pub_key_file" | ssh "$username@$server_ip" "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
    }
    
    log "服务器公钥配置完成"
    
    # 测试连接
    log "测试 SSH 连接..."
    ssh -i "$HOME/.ssh/$key_name" -o ConnectTimeout=10 "$username@$server_ip" "echo 'SSH 连接测试成功'" || {
        error "SSH 连接测试失败"
    }
    
    log "✅ SSH 连接测试成功"
}

# 生成 GitHub Secrets 配置
generate_github_secrets() {
    local key_name="${1:-cosmos-explorer}"
    local server_ip="$2"
    local username="${3:-root}"
    
    if [ -z "$server_ip" ]; then
        read -p "请输入服务器 IP 地址: " server_ip
    fi
    
    local priv_key_file="$HOME/.ssh/$key_name"
    
    if [ ! -f "$priv_key_file" ]; then
        error "私钥文件不存在: $priv_key_file"
    fi
    
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🐙 GitHub Secrets 配置${NC}"
    echo "=========================================="
    echo ""
    echo -e "${BLUE}在 GitHub 仓库设置中添加以下 Secrets:${NC}"
    echo ""
    echo "Secret Name: PROD_HOST"
    echo "Secret Value: $server_ip"
    echo ""
    echo "Secret Name: PROD_USERNAME"
    echo "Secret Value: $username"
    echo ""
    echo "Secret Name: PROD_SSH_KEY"
    echo "Secret Value:"
    echo "----------------------------------------"
    cat "$priv_key_file"
    echo "----------------------------------------"
    echo ""
    echo -e "${YELLOW}注意: 复制私钥内容时，请包含 -----BEGIN 和 -----END 行${NC}"
    echo "=========================================="
}

# 测试 SSH 连接
test_ssh_connection() {
    local server_ip="$1"
    local username="${2:-root}"
    local key_name="${3:-cosmos-explorer}"
    
    if [ -z "$server_ip" ]; then
        read -p "请输入服务器 IP 地址: " server_ip
    fi
    
    local priv_key_file="$HOME/.ssh/$key_name"
    
    if [ ! -f "$priv_key_file" ]; then
        error "私钥文件不存在: $priv_key_file"
    fi
    
    log "测试 SSH 连接到 $username@$server_ip..."
    
    ssh -i "$priv_key_file" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$username@$server_ip" "
        echo '✅ SSH 连接成功'
        echo '服务器信息:'
        echo '  主机名: \$(hostname)'
        echo '  系统: \$(cat /etc/os-release | grep PRETTY_NAME | cut -d'\"' -f2)'
        echo '  内核: \$(uname -r)'
        echo '  CPU: \$(nproc) 核'
        echo '  内存: \$(free -h | grep Mem | awk \"{print \\\$2}\")'
        echo '  磁盘: \$(df -h / | tail -1 | awk \"{print \\\$2}\")'
    " || error "SSH 连接失败"
}

# 显示使用帮助
show_help() {
    echo "SSH 密钥配置脚本"
    echo ""
    echo "用法: $0 [命令] [参数]"
    echo ""
    echo "命令:"
    echo "  generate [email]              生成新的 SSH 密钥对"
    echo "  show-public [key_name]        显示公钥内容"
    echo "  show-private [key_name]       显示私钥内容"
    echo "  setup-server [ip] [user]      配置服务器公钥"
    echo "  github-secrets [ip] [user]    生成 GitHub Secrets 配置"
    echo "  test [ip] [user]              测试 SSH 连接"
    echo "  help                          显示此帮助信息"
    echo ""
    echo "参数:"
    echo "  email      邮箱地址（用于生成密钥）"
    echo "  key_name   密钥名称（默认: cosmos-explorer）"
    echo "  ip         服务器 IP 地址"
    echo "  user       用户名（默认: root）"
    echo ""
    echo "示例:"
    echo "  $0 generate your-email@example.com"
    echo "  $0 setup-server 192.168.1.100 root"
    echo "  $0 test 192.168.1.100"
    echo "  $0 github-secrets 192.168.1.100"
}

# 主函数
main() {
    case "$1" in
        "generate")
            generate_ssh_key "$2" "$3"
            show_public_key "$3"
            ;;
        "show-public")
            show_public_key "$2"
            ;;
        "show-private")
            show_private_key "$2"
            ;;
        "setup-server")
            setup_server_key "$2" "$3" "$4"
            ;;
        "github-secrets")
            generate_github_secrets "$4" "$2" "$3"
            ;;
        "test")
            test_ssh_connection "$2" "$3" "$4"
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        "")
            echo "请指定命令。使用 '$0 help' 查看帮助。"
            ;;
        *)
            echo "未知命令: $1"
            echo "使用 '$0 help' 查看帮助。"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
