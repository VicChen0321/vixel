@echo off
chcp 65001 >nul
echo 🚀 啟動 Electron FFmpeg 工具...

REM 檢查 Node.js 是否安裝
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 錯誤：未找到 Node.js，請先安裝 Node.js 18+
    pause
    exit /b 1
)

REM 檢查 npm 是否安裝
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 錯誤：未找到 npm，請先安裝 npm
    pause
    exit /b 1
)

REM 檢查 FFmpeg 是否安裝
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  警告：未找到 FFmpeg，請先安裝 FFmpeg
    echo 請下載 FFmpeg 並加入系統 PATH
)

REM 安裝依賴
echo 📦 安裝依賴...
npm install

REM 啟動開發模式
echo 🎯 啟動開發模式...
npm run dev

pause
