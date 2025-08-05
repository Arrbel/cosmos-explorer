#!/bin/bash

# 设置所有脚本的执行权限

echo "🔧 设置脚本执行权限..."

# 设置脚本目录权限
chmod +x scripts/*.sh

# 设置 Makefile 权限
chmod +x Makefile

# 设置部署脚本权限
chmod +x deploy-*.sh

echo "✅ 权限设置完成！"

echo ""
echo "📋 可执行的脚本："
echo "  scripts/server-setup.sh    - 服务器环境一键安装"
echo "  scripts/deploy-aliyun.sh   - 阿里云部署脚本"
echo "  scripts/ssh-setup.sh       - SSH 密钥配置"
echo "  scripts/health-check.sh    - 健康检查脚本"
echo "  scripts/monitor.sh         - 实时监控脚本"
echo ""
echo "🎯 快速开始："
echo "  make help                  - 查看所有可用命令"
echo "  make quick-start           - 快速启动本地环境"
echo "  ./scripts/server-setup.sh  - 设置服务器环境"
