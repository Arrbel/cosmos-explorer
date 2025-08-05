#!/bin/bash

# 应用监控脚本
# 提供实时监控、性能分析和告警功能

set -e

# 配置变量
APP_NAME="cosmos-explorer"
CONTAINER_NAME="cosmos-explorer-prod"
MONITOR_INTERVAL=5
LOG_FILE="/var/log/cosmos-monitor.log"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 清屏函数
clear_screen() {
    clear
    echo -e "${CYAN}=========================================="
    echo -e "🌌 宇宙探索者 - 实时监控面板"
    echo -e "=========================================="
    echo -e "时间: $(date)"
    echo -e "监控间隔: ${MONITOR_INTERVAL}秒"
    echo -e "按 Ctrl+C 退出监控${NC}"
    echo ""
}

# 获取容器状态
get_container_status() {
    if docker ps | grep -q $CONTAINER_NAME; then
        echo -e "${GREEN}🟢 运行中${NC}"
        return 0
    elif docker ps -a | grep -q $CONTAINER_NAME; then
        echo -e "${RED}🔴 已停止${NC}"
        return 1
    else
        echo -e "${YELLOW}⚪ 不存在${NC}"
        return 2
    fi
}

# 获取应用健康状态
get_app_health() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null)
    
    case $response in
        "200")
            echo -e "${GREEN}✅ 健康 (HTTP $response)${NC}"
            return 0
            ;;
        "")
            echo -e "${RED}❌ 无响应${NC}"
            return 1
            ;;
        *)
            echo -e "${YELLOW}⚠️ 异常 (HTTP $response)${NC}"
            return 1
            ;;
    esac
}

# 获取容器资源使用情况
get_container_resources() {
    if ! docker ps | grep -q $CONTAINER_NAME; then
        echo -e "${RED}容器未运行${NC}"
        return 1
    fi
    
    local stats=$(docker stats $CONTAINER_NAME --no-stream --format "{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        local cpu=$(echo "$stats" | awk '{print $1}')
        local mem_usage=$(echo "$stats" | awk '{print $2}')
        local mem_perc=$(echo "$stats" | awk '{print $3}')
        local net_io=$(echo "$stats" | awk '{print $4}')
        local block_io=$(echo "$stats" | awk '{print $5}')
        
        echo -e "${BLUE}📊 容器资源使用:${NC}"
        echo -e "  CPU: $cpu"
        echo -e "  内存: $mem_usage ($mem_perc)"
        echo -e "  网络: $net_io"
        echo -e "  磁盘: $block_io"
        
        # CPU 使用率告警
        local cpu_num=$(echo "$cpu" | sed 's/%//')
        if (( $(echo "$cpu_num > 80" | bc -l) 2>/dev/null )); then
            echo -e "  ${RED}⚠️ CPU 使用率过高!${NC}"
        fi
        
        # 内存使用率告警
        local mem_num=$(echo "$mem_perc" | sed 's/%//')
        if (( $(echo "$mem_num > 80" | bc -l) 2>/dev/null )); then
            echo -e "  ${RED}⚠️ 内存使用率过高!${NC}"
        fi
    else
        echo -e "${RED}无法获取容器资源信息${NC}"
        return 1
    fi
}

# 获取系统资源使用情况
get_system_resources() {
    echo -e "${PURPLE}🖥️ 系统资源使用:${NC}"
    
    # CPU 使用率
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    echo -e "  CPU: ${cpu_usage}%"
    
    # 内存使用率
    local mem_info=$(free | grep Mem)
    local mem_total=$(echo $mem_info | awk '{print $2}')
    local mem_used=$(echo $mem_info | awk '{print $3}')
    local mem_percent=$(echo "scale=1; $mem_used * 100 / $mem_total" | bc)
    echo -e "  内存: ${mem_percent}% ($(echo $mem_info | awk '{printf "%.1fG/%.1fG", $3/1024/1024, $2/1024/1024}'))"
    
    # 磁盘使用率
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    local disk_info=$(df -h / | tail -1 | awk '{printf "%s/%s", $3, $2}')
    echo -e "  磁盘: ${disk_usage}% ($disk_info)"
    
    # 负载平均值
    local load_avg=$(uptime | awk -F'load average:' '{print $2}')
    echo -e "  负载:$load_avg"
    
    # 系统告警
    if [ $disk_usage -gt 85 ]; then
        echo -e "  ${RED}⚠️ 磁盘空间不足!${NC}"
    fi
    
    if (( $(echo "$mem_percent > 85" | bc -l) )); then
        echo -e "  ${RED}⚠️ 系统内存使用率过高!${NC}"
    fi
}

# 获取网络连接状态
get_network_status() {
    echo -e "${CYAN}🌐 网络状态:${NC}"
    
    # 检查端口监听
    local port_80=$(netstat -tlnp 2>/dev/null | grep ":80 " | wc -l)
    local port_443=$(netstat -tlnp 2>/dev/null | grep ":443 " | wc -l)
    
    echo -e "  端口 80: $([ $port_80 -gt 0 ] && echo -e "${GREEN}监听中${NC}" || echo -e "${RED}未监听${NC}")"
    echo -e "  端口 443: $([ $port_443 -gt 0 ] && echo -e "${GREEN}监听中${NC}" || echo -e "${RED}未监听${NC}")"
    
    # 检查外网连通性
    if ping -c 1 8.8.8.8 &> /dev/null; then
        echo -e "  外网连通: ${GREEN}正常${NC}"
    else
        echo -e "  外网连通: ${RED}异常${NC}"
    fi
    
    # 检查域名解析
    if nslookup google.com &> /dev/null; then
        echo -e "  DNS 解析: ${GREEN}正常${NC}"
    else
        echo -e "  DNS 解析: ${RED}异常${NC}"
    fi
}

# 获取最近的日志
get_recent_logs() {
    echo -e "${YELLOW}📝 最近日志 (最新10条):${NC}"
    
    if docker ps | grep -q $CONTAINER_NAME; then
        docker logs $CONTAINER_NAME --tail 10 2>/dev/null | while read line; do
            if echo "$line" | grep -qi error; then
                echo -e "  ${RED}$line${NC}"
            elif echo "$line" | grep -qi warn; then
                echo -e "  ${YELLOW}$line${NC}"
            else
                echo -e "  $line"
            fi
        done
    else
        echo -e "  ${RED}容器未运行，无法获取日志${NC}"
    fi
}

# 获取应用统计信息
get_app_stats() {
    echo -e "${GREEN}📈 应用统计:${NC}"
    
    if docker ps | grep -q $CONTAINER_NAME; then
        # 容器运行时间
        local uptime=$(docker inspect $CONTAINER_NAME --format='{{.State.StartedAt}}' 2>/dev/null)
        if [ ! -z "$uptime" ]; then
            local start_time=$(date -d "$uptime" +%s 2>/dev/null || echo "0")
            local current_time=$(date +%s)
            local running_time=$((current_time - start_time))
            local days=$((running_time / 86400))
            local hours=$(((running_time % 86400) / 3600))
            local minutes=$(((running_time % 3600) / 60))
            echo -e "  运行时间: ${days}天 ${hours}小时 ${minutes}分钟"
        fi
        
        # 重启次数
        local restart_count=$(docker inspect $CONTAINER_NAME --format='{{.RestartCount}}' 2>/dev/null || echo "0")
        echo -e "  重启次数: $restart_count"
        
        # 镜像信息
        local image=$(docker inspect $CONTAINER_NAME --format='{{.Config.Image}}' 2>/dev/null || echo "未知")
        echo -e "  镜像: $image"
    else
        echo -e "  ${RED}容器未运行${NC}"
    fi
}

# 实时监控模式
real_time_monitor() {
    echo -e "${GREEN}启动实时监控模式...${NC}"
    echo -e "${YELLOW}按 Ctrl+C 退出${NC}"
    echo ""
    
    while true; do
        clear_screen
        
        echo -e "${BLUE}🔍 容器状态:${NC} $(get_container_status)"
        echo -e "${BLUE}🏥 应用健康:${NC} $(get_app_health)"
        echo ""
        
        get_container_resources
        echo ""
        
        get_system_resources
        echo ""
        
        get_network_status
        echo ""
        
        get_app_stats
        echo ""
        
        get_recent_logs
        
        echo ""
        echo -e "${CYAN}下次更新: $(date -d "+$MONITOR_INTERVAL seconds")${NC}"
        
        sleep $MONITOR_INTERVAL
    done
}

# 生成监控报告
generate_report() {
    local report_file="/tmp/cosmos-monitor-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "=========================================="
        echo "宇宙探索者应用监控报告"
        echo "生成时间: $(date)"
        echo "=========================================="
        echo ""
        
        echo "1. 容器状态:"
        get_container_status
        echo ""
        
        echo "2. 应用健康:"
        get_app_health
        echo ""
        
        echo "3. 容器资源:"
        get_container_resources
        echo ""
        
        echo "4. 系统资源:"
        get_system_resources
        echo ""
        
        echo "5. 网络状态:"
        get_network_status
        echo ""
        
        echo "6. 应用统计:"
        get_app_stats
        echo ""
        
        echo "7. 最近日志:"
        get_recent_logs
        echo ""
        
        echo "=========================================="
        echo "报告结束"
        echo "=========================================="
    } > $report_file
    
    echo -e "${GREEN}监控报告已生成: $report_file${NC}"
    echo $report_file
}

# 性能测试
performance_test() {
    echo -e "${GREEN}开始性能测试...${NC}"
    
    if ! command -v ab &> /dev/null; then
        echo -e "${YELLOW}安装 Apache Bench (ab)...${NC}"
        if command -v apt &> /dev/null; then
            sudo apt install -y apache2-utils
        elif command -v yum &> /dev/null; then
            sudo yum install -y httpd-tools
        else
            echo -e "${RED}无法安装 ab 工具${NC}"
            return 1
        fi
    fi
    
    echo -e "${BLUE}执行并发测试 (100个请求，10个并发)...${NC}"
    ab -n 100 -c 10 http://localhost/ > /tmp/performance-test.txt 2>&1
    
    echo -e "${GREEN}性能测试完成，结果:${NC}"
    grep -E "(Requests per second|Time per request|Transfer rate)" /tmp/performance-test.txt
    
    echo ""
    echo -e "${BLUE}详细结果保存在: /tmp/performance-test.txt${NC}"
}

# 显示使用帮助
show_help() {
    echo "应用监控脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  monitor              启动实时监控模式"
    echo "  status               显示当前状态"
    echo "  report               生成监控报告"
    echo "  performance          执行性能测试"
    echo "  logs [lines]         显示应用日志"
    echo "  help                 显示此帮助信息"
    echo ""
    echo "选项:"
    echo "  --interval N         设置监控间隔（秒，默认5）"
    echo ""
    echo "示例:"
    echo "  $0 monitor                    # 启动实时监控"
    echo "  $0 status                     # 显示当前状态"
    echo "  $0 report                     # 生成监控报告"
    echo "  $0 logs 50                    # 显示最近50行日志"
    echo "  $0 monitor --interval 10      # 10秒间隔监控"
}

# 显示状态
show_status() {
    clear_screen
    
    echo -e "${BLUE}🔍 容器状态:${NC} $(get_container_status)"
    echo -e "${BLUE}🏥 应用健康:${NC} $(get_app_health)"
    echo ""
    
    get_container_resources
    echo ""
    
    get_system_resources
    echo ""
    
    get_network_status
    echo ""
    
    get_app_stats
}

# 显示日志
show_logs() {
    local lines="${1:-50}"
    
    echo -e "${GREEN}显示最近 $lines 行日志:${NC}"
    echo ""
    
    if docker ps | grep -q $CONTAINER_NAME; then
        docker logs $CONTAINER_NAME --tail $lines -f
    else
        echo -e "${RED}容器未运行，无法获取日志${NC}"
    fi
}

# 主函数
main() {
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --interval)
                MONITOR_INTERVAL="$2"
                shift 2
                ;;
            *)
                break
                ;;
        esac
    done
    
    case "$1" in
        "monitor")
            real_time_monitor
            ;;
        "status")
            show_status
            ;;
        "report")
            generate_report
            ;;
        "performance")
            performance_test
            ;;
        "logs")
            show_logs "$2"
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        "")
            show_status
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
