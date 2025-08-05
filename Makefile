# 宇宙探索者项目 Makefile
# 提供常用的开发和部署命令

.PHONY: help install dev build test lint format clean docker-build docker-run deploy-dev deploy-prod backup monitor logs

# 默认目标
.DEFAULT_GOAL := help

# 项目配置
PROJECT_NAME := cosmos-explorer
DOCKER_IMAGE := $(PROJECT_NAME)
DOCKER_TAG := latest
REGISTRY := registry.cn-hangzhou.aliyuncs.com
NAMESPACE := cosmos-explorer
FULL_IMAGE := $(REGISTRY)/$(NAMESPACE)/$(PROJECT_NAME):$(DOCKER_TAG)

# 颜色输出
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
RED := \033[0;31m
NC := \033[0m

# 帮助信息
help: ## 显示帮助信息
	@echo "$(GREEN)🌌 宇宙探索者项目 - 可用命令:$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(BLUE)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)示例:$(NC)"
	@echo "  make install     # 安装依赖"
	@echo "  make dev         # 启动开发服务器"
	@echo "  make build       # 构建生产版本"
	@echo "  make deploy-prod # 部署到生产环境"

# 开发环境
install: ## 安装项目依赖
	@echo "$(GREEN)📦 安装依赖...$(NC)"
	pnpm install --frozen-lockfile

dev: ## 启动开发服务器
	@echo "$(GREEN)🚀 启动开发服务器...$(NC)"
	pnpm dev

build: ## 构建生产版本
	@echo "$(GREEN)🔨 构建生产版本...$(NC)"
	pnpm build

preview: ## 预览生产版本
	@echo "$(GREEN)👀 预览生产版本...$(NC)"
	pnpm preview

# 代码质量
test: ## 运行测试
	@echo "$(GREEN)🧪 运行测试...$(NC)"
	pnpm test

test-ui: ## 运行测试 UI
	@echo "$(GREEN)🧪 启动测试 UI...$(NC)"
	pnpm test:ui

lint: ## 代码检查
	@echo "$(GREEN)🔍 代码检查...$(NC)"
	pnpm lint

lint-fix: ## 修复代码问题
	@echo "$(GREEN)🔧 修复代码问题...$(NC)"
	pnpm lint:fix

format: ## 格式化代码
	@echo "$(GREEN)✨ 格式化代码...$(NC)"
	pnpm format

type-check: ## TypeScript 类型检查
	@echo "$(GREEN)📝 TypeScript 类型检查...$(NC)"
	pnpm type-check

# Docker 相关
docker-build: ## 构建 Docker 镜像
	@echo "$(GREEN)🐳 构建 Docker 镜像...$(NC)"
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	@echo "$(GREEN)✅ 镜像构建完成: $(DOCKER_IMAGE):$(DOCKER_TAG)$(NC)"

docker-run: ## 运行 Docker 容器
	@echo "$(GREEN)🚀 启动 Docker 容器...$(NC)"
	docker run -d \
		--name $(PROJECT_NAME)-local \
		-p 3000:80 \
		--restart unless-stopped \
		$(DOCKER_IMAGE):$(DOCKER_TAG)
	@echo "$(GREEN)✅ 容器启动完成，访问: http://localhost:3000$(NC)"

docker-stop: ## 停止 Docker 容器
	@echo "$(YELLOW)🛑 停止 Docker 容器...$(NC)"
	-docker stop $(PROJECT_NAME)-local
	-docker rm $(PROJECT_NAME)-local

docker-push: ## 推送镜像到仓库
	@echo "$(GREEN)📤 推送镜像到仓库...$(NC)"
	docker tag $(DOCKER_IMAGE):$(DOCKER_TAG) $(FULL_IMAGE)
	docker push $(FULL_IMAGE)
	@echo "$(GREEN)✅ 镜像推送完成: $(FULL_IMAGE)$(NC)"

docker-pull: ## 从仓库拉取镜像
	@echo "$(GREEN)📥 从仓库拉取镜像...$(NC)"
	docker pull $(FULL_IMAGE)
	docker tag $(FULL_IMAGE) $(DOCKER_IMAGE):$(DOCKER_TAG)

# 部署相关
deploy-dev: ## 部署到开发环境
	@echo "$(GREEN)🚀 部署到开发环境...$(NC)"
	git push origin develop

deploy-prod: ## 部署到生产环境
	@echo "$(GREEN)🚀 部署到生产环境...$(NC)"
	git push origin main

deploy-tag: ## 创建版本标签并部署
	@read -p "请输入版本号 (例如 v1.0.0): " version; \
	echo "$(GREEN)🏷️ 创建版本标签: $$version$(NC)"; \
	git tag $$version; \
	git push origin $$version

# 服务器管理
server-setup: ## 设置服务器环境
	@echo "$(GREEN)⚙️ 设置服务器环境...$(NC)"
	chmod +x scripts/server-setup.sh
	./scripts/server-setup.sh

ssh-setup: ## 配置 SSH 密钥
	@echo "$(GREEN)🔑 配置 SSH 密钥...$(NC)"
	chmod +x scripts/ssh-setup.sh
	./scripts/ssh-setup.sh

# 监控和日志
monitor: ## 启动实时监控
	@echo "$(GREEN)📊 启动实时监控...$(NC)"
	chmod +x scripts/monitor.sh
	./scripts/monitor.sh monitor

status: ## 查看应用状态
	@echo "$(GREEN)📋 查看应用状态...$(NC)"
	chmod +x scripts/monitor.sh
	./scripts/monitor.sh status

logs: ## 查看应用日志
	@echo "$(GREEN)📝 查看应用日志...$(NC)"
	chmod +x scripts/monitor.sh
	./scripts/monitor.sh logs

health-check: ## 执行健康检查
	@echo "$(GREEN)🏥 执行健康检查...$(NC)"
	chmod +x scripts/health-check.sh
	./scripts/health-check.sh

health-report: ## 生成健康报告
	@echo "$(GREEN)📋 生成健康报告...$(NC)"
	chmod +x scripts/health-check.sh
	./scripts/health-check.sh --report

# 备份和恢复
backup: ## 备份应用数据
	@echo "$(GREEN)💾 备份应用数据...$(NC)"
	mkdir -p backups
	docker save $(DOCKER_IMAGE):$(DOCKER_TAG) | gzip > backups/$(PROJECT_NAME)-$(shell date +%Y%m%d-%H%M%S).tar.gz
	@echo "$(GREEN)✅ 备份完成$(NC)"

restore: ## 恢复应用数据
	@echo "$(YELLOW)📥 恢复应用数据...$(NC)"
	@echo "请手动指定备份文件: docker load < backups/backup-file.tar.gz"

# 清理
clean: ## 清理构建文件和缓存
	@echo "$(YELLOW)🧹 清理构建文件...$(NC)"
	rm -rf dist
	rm -rf node_modules/.cache
	pnpm store prune

clean-docker: ## 清理 Docker 资源
	@echo "$(YELLOW)🧹 清理 Docker 资源...$(NC)"
	-docker stop $(PROJECT_NAME)-local
	-docker rm $(PROJECT_NAME)-local
	docker system prune -f

clean-all: clean clean-docker ## 清理所有文件
	@echo "$(YELLOW)🧹 清理所有文件...$(NC)"
	rm -rf node_modules

# 开发工具
dev-tools: ## 安装开发工具
	@echo "$(GREEN)🛠️ 安装开发工具...$(NC)"
	npm install -g @commitlint/cli @commitlint/config-conventional
	npm install -g husky lint-staged

commit: ## 提交代码（带检查）
	@echo "$(GREEN)📝 提交代码...$(NC)"
	pnpm lint:fix
	pnpm format
	pnpm type-check
	pnpm test
	git add .
	@read -p "请输入提交信息: " message; \
	git commit -m "$$message"

# 性能测试
performance: ## 执行性能测试
	@echo "$(GREEN)⚡ 执行性能测试...$(NC)"
	chmod +x scripts/monitor.sh
	./scripts/monitor.sh performance

# 安全检查
security-check: ## 安全检查
	@echo "$(GREEN)🔒 执行安全检查...$(NC)"
	pnpm audit
	@if command -v trivy >/dev/null 2>&1; then \
		echo "$(GREEN)🔍 Docker 镜像安全扫描...$(NC)"; \
		trivy image $(DOCKER_IMAGE):$(DOCKER_TAG); \
	else \
		echo "$(YELLOW)⚠️ trivy 未安装，跳过镜像安全扫描$(NC)"; \
	fi

# 文档
docs: ## 生成文档
	@echo "$(GREEN)📚 生成文档...$(NC)"
	@echo "文档已存在于项目根目录:"
	@echo "  - README.md"
	@echo "  - 部署实施指南.md"
	@echo "  - 快速开始指南.md"
	@echo "  - DEPLOYMENT.md"

# 版本信息
version: ## 显示版本信息
	@echo "$(GREEN)📋 版本信息:$(NC)"
	@echo "  项目: $(PROJECT_NAME)"
	@echo "  Node.js: $(shell node --version)"
	@echo "  pnpm: $(shell pnpm --version)"
	@echo "  Docker: $(shell docker --version | cut -d' ' -f3 | cut -d',' -f1)"
	@echo "  Git: $(shell git --version | cut -d' ' -f3)"

# 快速启动
quick-start: install build docker-build docker-run ## 快速启动（安装->构建->Docker运行）
	@echo "$(GREEN)🎉 快速启动完成！$(NC)"
	@echo "$(GREEN)🌍 访问地址: http://localhost:3000$(NC)"

# 完整部署流程
full-deploy: lint test build docker-build docker-push deploy-prod ## 完整部署流程
	@echo "$(GREEN)🎉 完整部署流程完成！$(NC)"
