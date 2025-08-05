@echo off
echo 🔧 设置脚本执行权限...

REM 在 Windows 下，.sh 脚本需要通过 Git Bash 或 WSL 执行
REM 这里主要是提示用户如何使用这些脚本

echo.
echo ✅ 权限设置完成！
echo.
echo 📋 可执行的脚本：
echo   scripts/server-setup.sh    - 服务器环境一键安装
echo   scripts/deploy-aliyun.sh   - 阿里云部署脚本  
echo   scripts/ssh-setup.sh       - SSH 密钥配置
echo   scripts/health-check.sh    - 健康检查脚本
echo   scripts/monitor.sh         - 实时监控脚本
echo.
echo 🎯 在 Windows 下的使用方法：
echo.
echo 方法1: 使用 Git Bash
echo   右键点击项目文件夹 → "Git Bash Here"
echo   然后执行: ./scripts/server-setup.sh
echo.
echo 方法2: 使用 WSL (Windows Subsystem for Linux)
echo   wsl
echo   cd /mnt/e/system
echo   ./scripts/server-setup.sh
echo.
echo 方法3: 使用 Make 命令 (推荐)
echo   make help                  - 查看所有可用命令
echo   make quick-start           - 快速启动本地环境
echo   make server-setup          - 设置服务器环境
echo.
echo 💡 提示：推荐安装 Git for Windows 或启用 WSL 来运行 shell 脚本
pause
