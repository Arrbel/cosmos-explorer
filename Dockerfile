# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 配置 npm 镜像源并安装 pnpm（使用特定版本确保一致性）
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g pnpm@8.15.0

# 复制 package 文件（利用 Docker 缓存层）
COPY package.json pnpm-lock.yaml ./

# 配置 pnpm 镜像源并安装依赖（生产环境优化）
RUN pnpm config set registry https://registry.npmmirror.com && \
    pnpm install --frozen-lockfile --prod=false

# 复制源代码
COPY . .

# 构建项目（生产环境优化）
RUN pnpm build

# 生产阶段 - 使用更小的基础镜像
FROM nginx:1.25-alpine

# 安装必要的工具
RUN apk add --no-cache curl

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 设置正确的权限
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# 暴露端口
EXPOSE 80

# 使用非 root 用户运行
USER nginx

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
