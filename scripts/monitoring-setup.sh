#!/bin/bash

# 监控系统安装脚本
# 安装 Prometheus + Grafana + Node Exporter

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

# 创建监控目录
create_monitoring_dirs() {
    log "创建监控目录..."
    
    mkdir -p /opt/cosmos-explorer/monitoring/{prometheus,grafana,alertmanager}
    mkdir -p /opt/cosmos-explorer/monitoring/data/{prometheus,grafana}
    
    # 设置权限
    chown -R 472:472 /opt/cosmos-explorer/monitoring/data/grafana
    chown -R 65534:65534 /opt/cosmos-explorer/monitoring/data/prometheus
}

# 创建 Prometheus 配置
create_prometheus_config() {
    log "创建 Prometheus 配置..."
    
    cat > /opt/cosmos-explorer/monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # Prometheus 自身监控
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter (系统指标)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  # cAdvisor (容器指标)
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  # 应用健康检查
  - job_name: 'cosmos-explorer'
    static_configs:
      - targets: ['cosmos-explorer:80']
    metrics_path: '/health'
    scrape_interval: 30s
EOF
}

# 创建告警规则
create_alert_rules() {
    log "创建告警规则..."
    
    cat > /opt/cosmos-explorer/monitoring/prometheus/alert_rules.yml << 'EOF'
groups:
  - name: cosmos-explorer-alerts
    rules:
      # 应用不可用告警
      - alert: ApplicationDown
        expr: up{job="cosmos-explorer"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "宇宙探索者应用不可用"
          description: "应用已经停止响应超过1分钟"

      # 高 CPU 使用率告警
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU 使用率过高"
          description: "CPU 使用率超过 80% 已持续 5 分钟"

      # 高内存使用率告警
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "内存使用率过高"
          description: "内存使用率超过 85% 已持续 5 分钟"

      # 磁盘空间不足告警
      - alert: DiskSpaceLow
        expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "磁盘空间不足"
          description: "磁盘使用率超过 85%"

      # 容器重启告警
      - alert: ContainerRestarted
        expr: increase(container_start_time_seconds{name="cosmos-explorer-prod"}[1h]) > 0
        for: 0m
        labels:
          severity: warning
        annotations:
          summary: "容器重启"
          description: "容器在过去1小时内重启了"
EOF
}

# 创建 Grafana 配置
create_grafana_config() {
    log "创建 Grafana 配置..."
    
    # 数据源配置
    mkdir -p /opt/cosmos-explorer/monitoring/grafana/provisioning/{datasources,dashboards}
    
    cat > /opt/cosmos-explorer/monitoring/grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

    # 仪表板配置
    cat > /opt/cosmos-explorer/monitoring/grafana/provisioning/dashboards/dashboard.yml << 'EOF'
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF
}

# 创建 Docker Compose 监控配置
create_monitoring_compose() {
    log "创建监控 Docker Compose 配置..."
    
    cat > /opt/cosmos-explorer/docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  # Prometheus 监控
  prometheus:
    image: prom/prometheus:latest
    container_name: cosmos-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus:/etc/prometheus:ro
      - ./monitoring/data/prometheus:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
      - '--web.enable-admin-api'
    restart: unless-stopped
    networks:
      - monitoring

  # Grafana 可视化
  grafana:
    image: grafana/grafana:latest
    container_name: cosmos-grafana
    ports:
      - "3001:3000"
    volumes:
      - ./monitoring/data/grafana:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource
    restart: unless-stopped
    networks:
      - monitoring

  # Node Exporter 系统监控
  node-exporter:
    image: prom/node-exporter:latest
    container_name: cosmos-node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped
    networks:
      - monitoring

  # cAdvisor 容器监控
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cosmos-cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    privileged: true
    devices:
      - /dev/kmsg
    restart: unless-stopped
    networks:
      - monitoring

  # AlertManager 告警管理
  alertmanager:
    image: prom/alertmanager:latest
    container_name: cosmos-alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager:/etc/alertmanager:ro
    restart: unless-stopped
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:
EOF
}

# 创建 AlertManager 配置
create_alertmanager_config() {
    log "创建 AlertManager 配置..."
    
    cat > /opt/cosmos-explorer/monitoring/alertmanager/alertmanager.yml << 'EOF'
global:
  smtp_smarthost: 'smtp.qq.com:587'
  smtp_from: 'your-email@qq.com'
  smtp_auth_username: 'your-email@qq.com'
  smtp_auth_password: 'your-email-password'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    email_configs:
      - to: 'admin@cosmos-explorer.com'
        subject: '[告警] {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          告警名称: {{ .Annotations.summary }}
          告警详情: {{ .Annotations.description }}
          告警时间: {{ .StartsAt }}
          {{ end }}

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF
}

# 创建监控启动脚本
create_monitoring_scripts() {
    log "创建监控管理脚本..."
    
    cat > /opt/cosmos-explorer/scripts/monitoring.sh << 'EOF'
#!/bin/bash

# 监控系统管理脚本

COMPOSE_FILE="/opt/cosmos-explorer/docker-compose.monitoring.yml"

case "$1" in
    start)
        echo "启动监控系统..."
        docker-compose -f $COMPOSE_FILE up -d
        echo "监控系统已启动"
        echo "Prometheus: http://localhost:9090"
        echo "Grafana: http://localhost:3001 (admin/admin123)"
        echo "AlertManager: http://localhost:9093"
        ;;
    stop)
        echo "停止监控系统..."
        docker-compose -f $COMPOSE_FILE down
        echo "监控系统已停止"
        ;;
    restart)
        echo "重启监控系统..."
        docker-compose -f $COMPOSE_FILE restart
        echo "监控系统已重启"
        ;;
    status)
        echo "监控系统状态:"
        docker-compose -f $COMPOSE_FILE ps
        ;;
    logs)
        service=${2:-prometheus}
        echo "查看 $service 日志:"
        docker-compose -f $COMPOSE_FILE logs -f $service
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs [service]}"
        echo "服务列表: prometheus, grafana, node-exporter, cadvisor, alertmanager"
        exit 1
        ;;
esac
EOF

    chmod +x /opt/cosmos-explorer/scripts/monitoring.sh
}

# 安装监控系统
install_monitoring() {
    log "安装监控系统..."
    
    cd /opt/cosmos-explorer
    
    # 启动监控服务
    docker-compose -f docker-compose.monitoring.yml up -d
    
    # 等待服务启动
    sleep 30
    
    # 验证服务状态
    if curl -s http://localhost:9090 > /dev/null; then
        log "✅ Prometheus 启动成功"
    else
        warn "❌ Prometheus 启动失败"
    fi
    
    if curl -s http://localhost:3001 > /dev/null; then
        log "✅ Grafana 启动成功"
    else
        warn "❌ Grafana 启动失败"
    fi
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🎉 监控系统安装完成！${NC}"
    echo "=========================================="
    echo ""
    echo -e "${BLUE}访问地址：${NC}"
    echo "📊 Prometheus: http://your-server-ip:9090"
    echo "📈 Grafana: http://your-server-ip:3001"
    echo "   默认账号: admin / admin123"
    echo "🚨 AlertManager: http://your-server-ip:9093"
    echo "📋 Node Exporter: http://your-server-ip:9100"
    echo "🐳 cAdvisor: http://your-server-ip:8080"
    echo ""
    echo -e "${BLUE}管理命令：${NC}"
    echo "./scripts/monitoring.sh start    # 启动监控"
    echo "./scripts/monitoring.sh stop     # 停止监控"
    echo "./scripts/monitoring.sh status   # 查看状态"
    echo "./scripts/monitoring.sh logs     # 查看日志"
    echo ""
    echo -e "${YELLOW}注意：请在防火墙中开放相应端口${NC}"
    echo "=========================================="
}

# 主函数
main() {
    echo "=========================================="
    echo -e "${GREEN}🔍 安装监控系统${NC}"
    echo "=========================================="
    echo ""
    
    create_monitoring_dirs
    create_prometheus_config
    create_alert_rules
    create_grafana_config
    create_alertmanager_config
    create_monitoring_compose
    create_monitoring_scripts
    install_monitoring
    show_access_info
}

# 执行主函数
main "$@"
EOF
