#!/bin/bash

# 阿里云 OSS 一键部署脚本
# 使用前请先配置阿里云 CLI: https://help.aliyun.com/document_detail/121541.html

set -e

echo "🚀 开始部署到阿里云 OSS..."

# 配置变量 (请修改为你的实际配置)
BUCKET_NAME="your-bucket-name"
REGION="oss-cn-hangzhou"
CDN_DOMAIN="your-cdn-domain.com"

# 构建项目
echo "📦 构建项目..."
pnpm build

# 同步到 OSS
echo "☁️ 上传到 OSS..."
aliyun oss sync dist/ oss://$BUCKET_NAME/ \
  --region $REGION \
  --delete \
  --force \
  --exclude "*.map"

# 设置静态网站托管
echo "🌐 配置静态网站托管..."
aliyun oss website --bucket $BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

# 刷新 CDN 缓存 (如果配置了 CDN)
if [ ! -z "$CDN_DOMAIN" ]; then
  echo "🔄 刷新 CDN 缓存..."
  aliyun cdn RefreshObjectCaches \
    --ObjectPath "https://$CDN_DOMAIN/*" \
    --ObjectType Directory
fi

echo "✅ 部署完成！"
echo "🌍 访问地址: https://$BUCKET_NAME.$REGION.aliyuncs.com"
if [ ! -z "$CDN_DOMAIN" ]; then
  echo "🚀 CDN 地址: https://$CDN_DOMAIN"
fi
