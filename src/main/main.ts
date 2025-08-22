import { app, BrowserWindow, ipcMain, dialog, screen } from "electron";
import * as path from "path";
import { compressVideo, getVideoInfo } from "../ffmpeg/compress";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // 動態設定視窗大小 (佔螢幕 80%，但不超過 1600x1000)
  const winWidth = Math.min(Math.floor(width * 0.8), 1600);
  const winHeight = Math.min(Math.floor(height * 0.8), 1000);

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../assets/icon.png"),
    title: "Vixel - 專業影片壓縮工具",
  });

  // 載入 React 應用
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC 處理器
ipcMain.handle("select-video-file", async () => {
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Video Files", extensions: ["mp4", "avi", "mov", "mkv", "wmv", "flv", "webm"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// 添加獲取影片資訊的 IPC 處理器
ipcMain.handle("get-video-info", async (event, filePath: string) => {
  try {
    const info = await getVideoInfo(filePath);
    return info;
  } catch (error) {
    throw error instanceof Error ? error.message : "Unknown error";
  }
});

ipcMain.handle("compress-video", async (event, inputPath: string, vcodec: string, crf: number, progressChannel: string) => {
  try {
    // 創建取消令牌
    const cancelToken = { cancelled: false };

    // 存儲取消令牌到全局變數，以便後續取消
    (global as any).currentCancelToken = cancelToken;

    const outputPath = await compressVideo(
      inputPath,
      vcodec,
      crf,
      (progress, estimatedTime) => {
        // 通過指定的通道發送進度更新
        if (mainWindow) {
          mainWindow.webContents.send(progressChannel, progress, estimatedTime);
        }
      },
      cancelToken
    );

    // 清理取消令牌
    (global as any).currentCancelToken = null;

    // 獲取原始檔案大小
    const fs = require("fs");
    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(outputPath).size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      outputPath,
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    // 清理取消令牌
    (global as any).currentCancelToken = null;
    throw error instanceof Error ? error.message : "Unknown error";
  }
});

// 添加取消壓縮的 IPC 處理器
ipcMain.handle("cancel-compression", async (event) => {
  try {
    console.log("收到取消壓縮請求");
    const cancelToken = (global as any).currentCancelToken;
    console.log("當前取消令牌:", cancelToken);

    if (cancelToken) {
      console.log("正在取消壓縮...");
      console.log("取消令牌狀態:", {
        cancelled: cancelToken.cancelled,
        hasProcess: !!(cancelToken as any).process,
      });

      // 設置取消標誌
      cancelToken.cancelled = true;
      console.log("已設置取消標誌");

      // 如果有 FFmpeg 進程引用，直接終止它
      if ((cancelToken as any).process) {
        console.log("終止 FFmpeg 進程...");
        try {
          // 嘗試多種終止方式
          (cancelToken as any).process.kill("SIGTERM");
          console.log("已發送 SIGTERM 信號");

          // 如果 SIGTERM 無效，強制終止
          setTimeout(() => {
            try {
              (cancelToken as any).process.kill("SIGKILL");
              console.log("已發送 SIGKILL 信號");
            } catch (killError) {
              console.error("發送 SIGKILL 時發生錯誤:", killError);
            }
          }, 1000);
        } catch (killError) {
          console.error("終止 FFmpeg 進程時發生錯誤:", killError);
        }
      } else {
        console.log("沒有找到 FFmpeg 進程引用");
      }

      // 不要立即清理取消令牌，讓定時器檢查有機會執行
      console.log("已設置取消標誌，等待定時器檢查...");
      return { success: true };

      console.log("壓縮已被取消");
      return { success: true };
    } else {
      console.log("沒有正在進行的壓縮任務");
      return { success: false, error: "沒有正在進行的壓縮任務" };
    }
  } catch (error) {
    console.error("取消壓縮時發生錯誤:", error);
    return { success: false, error: "取消壓縮時發生錯誤" };
  }
});

// 處理未捕獲的異常
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  if (mainWindow) {
    mainWindow.webContents.send("error", error.message);
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  if (mainWindow) {
    mainWindow.webContents.send("error", "Unhandled promise rejection");
  }
});
