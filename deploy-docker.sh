#!/bin/bash

# Docker 一键部署脚本

set -e

# 配置变量
IMAGE_NAME="cosmos-explorer"
CONTAINER_NAME="cosmos-explorer-app"
PORT="3000"

echo "🐳 开始 Docker 部署..."

# 停止并删除旧容器
echo "🛑 停止旧容器..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker build -t $IMAGE_NAME .

# 运行容器
echo "🚀 启动新容器..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:80 \
  --restart unless-stopped \
  $IMAGE_NAME

echo "✅ 部署完成！"
echo "🌍 访问地址: http://localhost:$PORT"

# 显示容器状态
docker ps | grep $CONTAINER_NAME
