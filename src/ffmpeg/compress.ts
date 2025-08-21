import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

// 獲取 ffmpeg 二進制檔案路徑
function getFFmpegPath(): string {
  if (!ffmpegStatic) {
    throw new Error("FFmpeg 二進制檔案未找到");
  }
  return ffmpegStatic;
}

export interface CompressionOptions {
  inputPath: string;
  vcodec: string;
  crf: number;
}

export interface VideoInfo {
  format: {
    duration: number;
    size: number;
    bit_rate: string;
  };
  streams: Array<{
    codec_type: string;
    codec_name: string;
    width?: number;
    height?: number;
    duration?: number;
  }>;
}

export async function compressVideo(inputPath: string, vcodec: string = "libx264", crf: number = 23, progressCallback?: (progress: number) => void, cancelToken?: { cancelled: boolean }): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // 檢查輸入檔案是否存在
      if (!fs.existsSync(inputPath)) {
        reject(new Error(`輸入檔案不存在: ${inputPath}`));
        return;
      }

      // 獲取影片總時長
      const videoInfo = await getVideoInfo(inputPath);
      const totalDuration = videoInfo.format.duration || 0;

      if (totalDuration === 0) {
        reject(new Error("無法獲取影片時長"));
        return;
      }

      // 生成輸出檔案路徑
      const inputDir = path.dirname(inputPath);
      const inputName = path.basename(inputPath, path.extname(inputPath));
      const inputExt = path.extname(inputPath);
      const outputPath = path.join(inputDir, `${inputName}_compressed${inputExt}`);

      // 檢查輸出檔案是否已存在，如果存在則刪除
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      let lastProgress = 0;
      let lastProgressTime = 0;
      console.log(`影片總時長: ${totalDuration} 秒`);

      // 構建 FFmpeg 命令參數
      const ffmpegArgs = [
        "-i",
        inputPath,
        "-c:v",
        vcodec,
        "-crf",
        crf.toString(),
        "-preset",
        "medium",
        "-movflags",
        "+faststart",
        "-c:a",
        "aac",
        "-ac",
        "2",
        "-ar",
        "44100",
        "-y", // 覆蓋輸出檔案
        outputPath,
      ];

      console.log("FFmpeg 命令參數:", ffmpegArgs.join(" "));

      // 使用 ffmpeg-static 的路徑啟動 FFmpeg 進程
      const ffmpegPath = getFFmpegPath();
      const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

      // 將進程引用存儲到 cancelToken
      if (cancelToken) {
        (cancelToken as any).process = ffmpegProcess;
        console.log("已設置 FFmpeg 進程引用到取消令牌");
      }

      let stderrData = "";

      // 處理 stderr 輸出（FFmpeg 的進度信息）
      ffmpegProcess.stderr.on("data", (data) => {
        const stderrLine = data.toString();
        stderrData += stderrLine;

        // 檢查是否已取消
        if (cancelToken?.cancelled) {
          console.log("壓縮已被取消，終止進程...");
          ffmpegProcess.kill("SIGKILL");
          return;
        }

        // 解析進度信息
        const progressMatch = stderrLine.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
        if (progressMatch && progressCallback) {
          const hours = parseInt(progressMatch[1]);
          const minutes = parseInt(progressMatch[2]);
          const seconds = parseFloat(progressMatch[3]);
          const currentTimeInSeconds = hours * 3600 + minutes * 60 + seconds;

          // 計算進度百分比
          if (totalDuration > 0) {
            const currentProgress = Math.round((currentTimeInSeconds / totalDuration) * 100);

            // 避免重複的進度更新和亂跳
            if (currentProgress !== lastProgress && currentProgress > lastProgress && currentProgress <= 100 && currentProgress >= 0 && currentTimeInSeconds > lastProgressTime) {
              // 確保進度不會倒退，且時間在增加
              if (currentProgress >= lastProgress && currentTimeInSeconds >= lastProgressTime) {
                lastProgress = currentProgress;
                lastProgressTime = currentTimeInSeconds;
                console.log(`壓縮進度: ${currentProgress}% (${currentTimeInSeconds}s / ${totalDuration}s)`);
                progressCallback(Math.min(currentProgress, 100));
              }
            }
          }
        }

        console.log("FFmpeg stderr:", stderrLine.trim());
      });

      // 處理進程退出
      ffmpegProcess.on("close", (code) => {
        if (cancelToken?.cancelled) {
          console.log("壓縮已被取消，清理資源...");
          // 清理取消令牌
          if ((global as any).currentCancelToken === cancelToken) {
            (global as any).currentCancelToken = null;
            console.log("已清理取消令牌");
          }
          reject(new Error("壓縮已被取消"));
          return;
        }

        if (code === 0) {
          console.log("FFmpeg 進程正常退出，代碼:", code);

          // 檢查輸出檔案是否存在
          if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            if (stats.size > 0) {
              console.log("影片壓縮完成");
              resolve(outputPath);
            } else {
              reject(new Error("輸出檔案大小為 0，壓縮可能失敗"));
            }
          } else {
            reject(new Error("輸出檔案未生成"));
          }
        } else {
          console.error("FFmpeg 進程異常退出，代碼:", code);
          reject(new Error(`FFmpeg 進程異常退出，代碼: ${code}`));
        }
      });

      // 處理進程錯誤
      ffmpegProcess.on("error", (err) => {
        if (cancelToken?.cancelled) {
          console.log("壓縮已被取消，清理資源...");
          // 清理取消令牌
          if ((global as any).currentCancelToken === cancelToken) {
            (global as any).currentCancelToken = null;
            console.log("已清理取消令牌");
          }
          reject(new Error("壓縮已被取消"));
          return;
        }

        console.error("FFmpeg 進程錯誤:", err);
        reject(new Error(`FFmpeg 進程錯誤: ${err.message}`));
      });

      // 設置定時器檢查取消狀態
      if (cancelToken) {
        console.log("設置定時器檢查取消狀態...");
        const cancelCheckInterval = setInterval(() => {
          console.log("定時器檢查中... 取消狀態:", cancelToken.cancelled);
          if (cancelToken.cancelled) {
            console.log("定時器檢測到取消，終止 FFmpeg 進程...");
            clearInterval(cancelCheckInterval);
            try {
              ffmpegProcess.kill("SIGKILL");
              console.log("已發送 SIGKILL 信號");
            } catch (error) {
              console.error("終止 FFmpeg 進程時發生錯誤:", error);
            }
            reject(new Error("壓縮已被取消"));
          }
        }, 100); // 每 100ms 檢查一次
      }
    } catch (error) {
      reject(new Error(`壓縮準備失敗: ${error instanceof Error ? error.message : "Unknown error"}`));
    }
  });
}

// 獲取影片資訊（使用 ffmpeg-static）
export function getVideoInfo(inputPath: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    const ffprobePath = ffprobeStatic.path;
    const ffprobeArgs = ["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", inputPath];

    const ffprobeProcess = spawn(ffprobePath, ffprobeArgs);
    let stdoutData = "";
    let stderrData = "";

    ffprobeProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    ffprobeProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    ffprobeProcess.on("close", (code) => {
      if (code === 0) {
        try {
          const metadata = JSON.parse(stdoutData);
          resolve(metadata);
        } catch (error) {
          reject(new Error(`無法解析影片資訊: ${error instanceof Error ? error.message : "Unknown error"}`));
        }
      } else {
        reject(new Error(`FFprobe 進程異常退出，代碼: ${code}, 錯誤: ${stderrData}`));
      }
    });

    ffprobeProcess.on("error", (err) => {
      reject(new Error(`FFprobe 進程錯誤: ${err.message}`));
    });
  });
}

// 檢查 FFmpeg 是否可用
export function checkFFmpegAvailability(): boolean {
  try {
    const ffmpegPath = getFFmpegPath();
    return !!ffmpegPath && fs.existsSync(ffmpegPath);
  } catch (error) {
    return false;
  }
}
