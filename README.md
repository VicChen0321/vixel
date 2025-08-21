# Electron FFmpeg 影片壓縮工具

一個基於 Electron 的桌面應用程式，使用 FFmpeg 進行影片壓縮。

## 功能特色

- 🎥 支援多種影片格式 (MP4, AVI, MOV, MKV, WMV, FLV, WebM)
- ⚙️ 可自訂影片編碼器 (H.264, H.265/HEVC, VP9)
- 📊 可調整 CRF 值控制壓縮品質
- 📈 即時顯示壓縮進度
- 🖥️ 跨平台支援 (Windows, macOS, Linux)
- 🎨 現代化的 Material-UI 介面

## 系統需求

- Node.js 18+ 
- FFmpeg (需要預先安裝)

### FFmpeg 安裝

#### macOS
```bash
# 使用 Homebrew
brew install ffmpeg
```

#### Windows
1. 下載 FFmpeg: https://ffmpeg.org/download.html
2. 解壓縮到任意目錄
3. 將 FFmpeg 的 bin 目錄加入系統 PATH

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

## 安裝與執行

### 1. 安裝依賴
```bash
npm install
```

### 2. 開發模式執行
```bash
npm run dev
```

### 3. 建置應用程式
```bash
# 建置所有平台
npm run build

# 建置 macOS
npm run dist:mac

# 建置 Windows
npm run dist:win
```

## 專案結構

```
electron-ffmpeg-tool/
├── src/
│   ├── main/           # Electron 主程序
│   │   ├── main.ts     # 主程序入口
│   │   └── preload.ts  # 預載入腳本
│   ├── renderer/       # React 前端
│   │   ├── index.html  # HTML 入口
│   │   ├── index.tsx   # React 入口
│   │   └── App.tsx     # 主要應用元件
│   └── ffmpeg/         # FFmpeg 相關功能
│       └── compress.ts # 影片壓縮模組
├── dist/               # 建置輸出目錄
├── package.json        # 專案配置
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # Vite 配置
└── README.md           # 專案說明
```

## 使用說明

1. **選擇影片檔案**: 點擊「選擇影片檔案」按鈕選擇要壓縮的影片
2. **設定壓縮參數**:
   - **影片編碼器**: 選擇 H.264、H.265/HEVC 或 VP9
   - **CRF 值**: 控制壓縮品質 (數值越低品質越好，檔案越大)
3. **開始壓縮**: 點擊「開始壓縮」按鈕開始處理
4. **監控進度**: 查看壓縮進度條和百分比
5. **完成**: 壓縮完成後，輸出檔案會保存在原檔案同目錄下

## 技術架構

- **Electron**: 桌面應用程式框架
- **React**: 前端 UI 框架
- **TypeScript**: 型別安全的 JavaScript
- **Vite**: 前端建置工具
- **Material-UI**: UI 元件庫
- **fluent-ffmpeg**: Node.js FFmpeg 封裝

## 建置配置

### 開發環境
- 使用 `npm run dev` 啟動開發伺服器
- 支援熱重載和開發者工具

### 生產建置
- 使用 `npm run build` 建置前端和後端
- 使用 `npm run dist` 打包成可執行檔

## 故障排除

### FFmpeg 路徑問題
如果遇到 FFmpeg 路徑問題，請確保：
1. FFmpeg 已正確安裝
2. FFmpeg 在系統 PATH 中
3. 在 macOS 上，FFmpeg 通常位於 `/opt/homebrew/bin/ffmpeg`

### 編碼器不支援
某些編碼器可能需要額外的 FFmpeg 編譯選項：
- H.265/HEVC: 需要 `--enable-libx265`
- VP9: 需要 `--enable-libvpx`

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 更新日誌

### v1.0.0
- 初始版本
- 支援基本影片壓縮功能
- 跨平台支援
- Material-UI 介面
