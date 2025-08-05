# 🚀 部署指南

## 概述

本项目使用 CI/CD + GitHub + Docker 的现代化部署方案，支持多环境自动化部署。

## 🏗️ 架构图

```
GitHub Repository
       ↓
GitHub Actions (CI/CD)
       ↓
Aliyun Container Registry
       ↓
Aliyun ECS (Docker)
```

## 📋 部署前准备

### 1. 阿里云服务配置

#### 容器镜像服务 (ACR)
1. 登录阿里云控制台
2. 开通容器镜像服务
3. 创建命名空间：`your-namespace`
4. 创建镜像仓库：`cosmos-explorer`

#### ECS 服务器
1. 创建 ECS 实例（推荐配置：2核4G）
2. 安装 Docker 和 Docker Compose
3. 配置安全组（开放 80、443、22 端口）

### 2. GitHub Secrets 配置

在 GitHub 仓库设置中添加以下 Secrets：

```
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_DOCKER_USERNAME=your_docker_username
ALIYUN_DOCKER_PASSWORD=your_docker_password
PROD_HOST=your.production.server.com
PROD_USERNAME=root
PROD_SSH_KEY=your_private_ssh_key
DEV_HOST=your.development.server.com
DEV_USERNAME=root
DEV_SSH_KEY=your_dev_private_ssh_key
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

## 🚀 部署流程

### 自动部署

1. **开发环境部署**
   ```bash
   git push origin develop
   ```

2. **生产环境部署**
   ```bash
   git push origin main
   # 或者创建 tag
   git tag v1.0.0
   git push origin v1.0.0
   ```

### 手动部署

1. **本地构建测试**
   ```bash
   docker build -t cosmos-explorer .
   docker run -p 3000:80 cosmos-explorer
   ```

2. **服务器手动部署**
   ```bash
   # 上传部署脚本到服务器
   scp scripts/deploy-aliyun.sh user@server:/opt/
   
   # 在服务器上执行
   chmod +x /opt/deploy-aliyun.sh
   /opt/deploy-aliyun.sh production latest
   ```

## 🔧 环境配置

### 开发环境
- 分支：`develop`
- 端口：`3000`
- 域名：`dev.cosmos-explorer.com`

### 生产环境
- 分支：`main`
- 端口：`80`
- 域名：`cosmos-explorer.com`

## 📊 监控和日志

### 健康检查
```bash
curl http://your-server/health
```

### 容器状态
```bash
docker ps
docker logs cosmos-explorer-prod
```

### 性能监控
- Prometheus: `http://your-server:9090`
- 容器资源使用情况

## 🔄 回滚策略

### 自动回滚
如果健康检查失败，系统会自动回滚到上一个版本。

### 手动回滚
```bash
# 查看可用的备份镜像
docker images | grep cosmos-explorer

# 回滚到指定版本
docker stop cosmos-explorer-prod
docker run -d --name cosmos-explorer-prod -p 80:80 cosmos-explorer:backup-20240804-1430
```

## 🛠️ 故障排除

### 常见问题

1. **镜像拉取失败**
   ```bash
   # 检查网络连接
   ping registry.cn-hangzhou.aliyuncs.com
   
   # 重新登录
   docker login registry.cn-hangzhou.aliyuncs.com
   ```

2. **容器启动失败**
   ```bash
   # 查看日志
   docker logs cosmos-explorer-prod
   
   # 检查端口占用
   netstat -tlnp | grep :80
   ```

3. **健康检查失败**
   ```bash
   # 进入容器检查
   docker exec -it cosmos-explorer-prod sh
   curl localhost/health
   ```

## 📈 性能优化

### Docker 镜像优化
- 多阶段构建减少镜像大小
- 使用 Alpine Linux 基础镜像
- 启用 gzip 和 brotli 压缩

### 网络优化
- CDN 加速静态资源
- 启用 HTTP/2
- 配置适当的缓存策略

## 🔐 安全配置

### 容器安全
- 使用非 root 用户运行
- 限制容器资源使用
- 定期更新基础镜像

### 网络安全
- 配置防火墙规则
- 使用 HTTPS
- 设置安全头

## 📞 联系支持

如有部署问题，请联系：
- 技术支持：tech@cosmos-explorer.com
- 文档更新：docs@cosmos-explorer.com
