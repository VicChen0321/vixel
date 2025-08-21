import { contextBridge, ipcRenderer } from "electron";

// 暴露安全的 API 到渲染程序
contextBridge.exposeInMainWorld("electronAPI", {
  // 選擇影片檔案
  selectVideoFile: () => ipcRenderer.invoke("select-video-file"),

  // 壓縮影片
  compressVideo: (data: { inputPath: string; vcodec: string; crf: number }) => ipcRenderer.invoke("compress-video", data),

  // 取消壓縮
  cancelCompression: () => ipcRenderer.invoke("cancel-compression"),

  // 監聽壓縮進度
  onCompressionProgress: (callback: (progress: number) => void) => {
    ipcRenderer.on("compression-progress", (event, progress) => callback(progress));
  },

  // 監聽錯誤
  onError: (callback: (error: string) => void) => {
    ipcRenderer.on("error", (event, error) => callback(error));
  },

  // 移除監聽器
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
