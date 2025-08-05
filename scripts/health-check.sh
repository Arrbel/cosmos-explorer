#!/bin/bash

# 应用健康检查脚本
# 用于监控应用状态并发送告警

set -e

# 配置变量
APP_NAME="cosmos-explorer"
CONTAINER_NAME="cosmos-explorer-prod"
HEALTH_URL="http://localhost/health"
LOG_FILE="/var/log/cosmos-health-check.log"
ALERT_EMAIL="admin@cosmos-explorer.com"
SLACK_WEBHOOK=""  # 可选：Slack 通知

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 日志函数
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a $LOG_FILE
}

# 发送告警
send_alert() {
    local message="$1"
    local severity="$2"
    
    # 邮件告警
    if command -v mail &> /dev/null && [ ! -z "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "[$severity] $APP_NAME 告警" $ALERT_EMAIL
    fi
    
    # Slack 告警
    if [ ! -z "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"[$severity] $APP_NAME: $message\"}" \
            $SLACK_WEBHOOK
    fi
}

# 检查容器是否运行
check_container_running() {
    if docker ps | grep -q $CONTAINER_NAME; then
        log "✅ 容器 $CONTAINER_NAME 正在运行"
        return 0
    else
        error "❌ 容器 $CONTAINER_NAME 未运行"
        return 1
    fi
}

# 检查应用健康状态
check_app_health() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        log "✅ 应用健康检查通过 (HTTP $response)"
        return 0
    else
        error "❌ 应用健康检查失败 (HTTP $response)"
        return 1
    fi
}

# 检查容器资源使用
check_container_resources() {
    local stats=$(docker stats $CONTAINER_NAME --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        log "📊 容器资源使用情况:"
        echo "$stats" | tee -a $LOG_FILE
        
        # 提取 CPU 和内存使用率
        local cpu_usage=$(echo "$stats" | tail -n 1 | awk '{print $1}' | sed 's/%//')
        local mem_usage=$(echo "$stats" | tail -n 1 | awk '{print $2}' | cut -d'/' -f1)
        
        # 检查 CPU 使用率（超过 80% 告警）
        if (( $(echo "$cpu_usage > 80" | bc -l) )); then
            warn "⚠️ CPU 使用率过高: ${cpu_usage}%"
            send_alert "CPU 使用率过高: ${cpu_usage}%" "WARNING"
        fi
        
        return 0
    else
        error "❌ 无法获取容器资源信息"
        return 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    log "💾 磁盘使用率: ${disk_usage}%"
    
    if [ $disk_usage -gt 85 ]; then
        warn "⚠️ 磁盘空间不足: ${disk_usage}%"
        send_alert "磁盘空间不足: ${disk_usage}%" "WARNING"
    fi
}

# 检查内存使用
check_memory_usage() {
    local mem_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    
    log "🧠 系统内存使用率: ${mem_usage}%"
    
    if (( $(echo "$mem_usage > 85" | bc -l) )); then
        warn "⚠️ 系统内存使用率过高: ${mem_usage}%"
        send_alert "系统内存使用率过高: ${mem_usage}%" "WARNING"
    fi
}

# 检查应用日志错误
check_app_logs() {
    local error_count=$(docker logs $CONTAINER_NAME --since "1h" 2>/dev/null | grep -i error | wc -l)
    
    if [ $error_count -gt 10 ]; then
        warn "⚠️ 最近1小时内发现 $error_count 个错误日志"
        send_alert "最近1小时内发现 $error_count 个错误日志" "WARNING"
    else
        log "📝 应用日志检查正常 (错误数: $error_count)"
    fi
}

# 检查网络连通性
check_network_connectivity() {
    if ping -c 1 8.8.8.8 &> /dev/null; then
        log "🌐 网络连通性正常"
        return 0
    else
        error "❌ 网络连通性异常"
        send_alert "服务器网络连通性异常" "CRITICAL"
        return 1
    fi
}

# 自动修复尝试
auto_repair() {
    log "🔧 尝试自动修复..."
    
    # 如果容器未运行，尝试重启
    if ! check_container_running; then
        log "尝试重启容器..."
        docker start $CONTAINER_NAME || {
            error "容器重启失败"
            send_alert "容器重启失败，需要人工干预" "CRITICAL"
            return 1
        }
        
        # 等待容器启动
        sleep 10
        
        # 再次检查
        if check_container_running && check_app_health; then
            log "✅ 自动修复成功"
            send_alert "应用已自动修复并恢复正常" "INFO"
            return 0
        else
            error "自动修复失败"
            send_alert "自动修复失败，需要人工干预" "CRITICAL"
            return 1
        fi
    fi
}

# 生成健康报告
generate_health_report() {
    local report_file="/tmp/cosmos-health-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "=========================================="
        echo "宇宙探索者应用健康报告"
        echo "生成时间: $(date)"
        echo "=========================================="
        echo ""
        
        echo "1. 容器状态:"
        docker ps | grep $CONTAINER_NAME || echo "容器未运行"
        echo ""
        
        echo "2. 应用响应:"
        curl -s $HEALTH_URL || echo "应用无响应"
        echo ""
        
        echo "3. 系统资源:"
        echo "CPU 使用率:"
        top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//'
        echo "内存使用:"
        free -h
        echo "磁盘使用:"
        df -h
        echo ""
        
        echo "4. 容器资源:"
        docker stats $CONTAINER_NAME --no-stream 2>/dev/null || echo "无法获取容器资源信息"
        echo ""
        
        echo "5. 最近错误日志:"
        docker logs $CONTAINER_NAME --since "1h" 2>/dev/null | grep -i error | tail -10 || echo "无错误日志"
        echo ""
        
        echo "=========================================="
    } > $report_file
    
    log "📋 健康报告已生成: $report_file"
    echo $report_file
}

# 主检查函数
main_check() {
    log "🔍 开始健康检查..."
    
    local all_checks_passed=true
    
    # 执行各项检查
    check_network_connectivity || all_checks_passed=false
    check_container_running || all_checks_passed=false
    check_app_health || all_checks_passed=false
    check_container_resources || all_checks_passed=false
    check_disk_space || all_checks_passed=false
    check_memory_usage || all_checks_passed=false
    check_app_logs || all_checks_passed=false
    
    if [ "$all_checks_passed" = true ]; then
        log "✅ 所有健康检查通过"
        return 0
    else
        error "❌ 部分健康检查失败"
        
        # 尝试自动修复
        if [ "$1" = "--auto-repair" ]; then
            auto_repair
        fi
        
        return 1
    fi
}

# 显示使用帮助
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --auto-repair    自动尝试修复问题"
    echo "  --report         生成详细健康报告"
    echo "  --help           显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                    # 执行基本健康检查"
    echo "  $0 --auto-repair     # 执行检查并尝试自动修复"
    echo "  $0 --report          # 生成详细报告"
}

# 主函数
main() {
    case "$1" in
        --auto-repair)
            main_check --auto-repair
            ;;
        --report)
            main_check
            generate_health_report
            ;;
        --help)
            show_help
            ;;
        "")
            main_check
            ;;
        *)
            echo "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
