@echo off
cd /d "%~dp0"
echo 安装前端依赖...
npm install
echo.
echo 启动前端开发服务器...
npm start
