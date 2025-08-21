#!/bin/bash

echo "🚀 啟動 Electron FFmpeg 工具..."

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤：未找到 Node.js，請先安裝 Node.js 18+"
    exit 1
fi

# 檢查 npm 是否安裝
if ! command -v npm &> /dev/null; then
    echo "❌ 錯誤：未找到 npm，請先安裝 npm"
    exit 1
fi

# 檢查 FFmpeg 是否安裝
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  警告：未找到 FFmpeg，請先安裝 FFmpeg"
    echo "macOS: brew install ffmpeg"
    echo "Ubuntu/Debian: sudo apt install ffmpeg"
    echo "Windows: 下載並加入 PATH"
fi

# 安裝依賴
echo "📦 安裝依賴..."
npm install

# 啟動開發模式
echo "🎯 啟動開發模式..."
npm run dev
