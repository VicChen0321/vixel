import { contextBridge, ipcRenderer } from "electron";

// 暴露安全的 API 到渲染程序
contextBridge.exposeInMainWorld("electronAPI", {
  // 選擇影片檔案
  selectVideoFile: () => ipcRenderer.invoke("select-video-file"),

  // 獲取影片資訊
  getVideoInfo: (filePath: string) => ipcRenderer.invoke("get-video-info", filePath),

  // 壓縮影片
  compressVideo: (inputPath: string, vcodec: string, crf: number, resolution: string, acodec: string, progressCallback: (progress: number, estimatedTime?: string) => void) => {
    // 創建一個唯一的通道名稱來處理進度回調
    const channelName = `progress-${Date.now()}-${Math.random()}`;

    // 監聽進度更新
    const progressListener = (event: any, progress: number, estimatedTime?: string) => {
      progressCallback(progress, estimatedTime);
    };

    ipcRenderer.on(channelName, progressListener);

    // 調用壓縮方法
    return ipcRenderer.invoke("compress-video", inputPath, vcodec, crf, resolution, acodec, channelName).finally(() => {
      // 清理監聽器
      ipcRenderer.removeAllListeners(channelName);
    });
  },

  // 取消壓縮
  cancelCompression: () => ipcRenderer.invoke("cancel-compression"),
});
