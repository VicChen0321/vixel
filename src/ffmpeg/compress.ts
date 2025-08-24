import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";

export interface CancelToken {
  cancelled: boolean;
  process?: any;
}

export interface CompressionOptions {
  inputPath: string;
  vcodec?: string;
  crf?: number;
  resolution?: string;
  acodec?: string;
  progressCallback?: (progress: number, estimatedTime?: string) => void;
  cancelToken?: CancelToken;
}

export interface VideoInfo {
  duration: number;
  size: number;
  format: string;
}

// ======== 路徑工具 ========
function getFFmpegPath(): string {
  let ffmpegPath: string = "";

  try {
    // 嘗試在開發環境中載入模組
    const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
    ffmpegPath = ffmpegInstaller.path;

    // 處理打包後的路徑問題
    if (ffmpegPath.includes("app.asar") && !ffmpegPath.includes("app.asar.unpacked")) {
      ffmpegPath = ffmpegPath.replace("app.asar", "app.asar.unpacked");
    }
  } catch (error) {
    // 在打包環境中，直接構建路徑
    const platform = process.platform === "darwin" ? "darwin" : process.platform === "win32" ? "win32" : "linux";
    const arch = process.arch === "arm64" ? "arm64" : "x64";
    const ext = process.platform === "win32" ? ".exe" : "";

    // 嘗試多個可能的路徑和架構
    const architectures = [arch]; // 先嘗試當前架構
    if (arch === "x64" && platform === "darwin") {
      architectures.push("arm64"); // 只在 macOS 上嘗試 arm64（透過 Rosetta）
    }

    let found = false;
    for (const testArch of architectures) {
      if (found) break;

      let possiblePaths: string[] = [];

      if (platform === "win32") {
        possiblePaths = [
          // Windows extraResources 路徑
          path.join(process.resourcesPath, "@ffmpeg-installer", `${platform}-${testArch}`, `ffmpeg${ext}`),
          // Windows app.asar.unpacked 路徑
          path.join(process.resourcesPath, "app.asar.unpacked", "node_modules", "@ffmpeg-installer", `${platform}-${testArch}`, `ffmpeg${ext}`),
          // Windows 相對於可執行檔案的路徑
          path.join(path.dirname(process.execPath), "resources", "@ffmpeg-installer", `${platform}-${testArch}`, `ffmpeg${ext}`),
          // 開發環境中的通用路徑
          path.join(process.cwd(), "node_modules", "@ffmpeg-installer", `${platform}-${testArch}`, `ffmpeg${ext}`),
        ];
      } else {
        possiblePaths = [
          // extraResources 路徑
          path.join(process.resourcesPath, "@ffmpeg-installer", `${platform}-${testArch}`, `ffmpeg${ext}`),
          // app.asar.unpacked 路徑
          path.join(process.resourcesPath, "app.asar.unpacked", "node_modules", "@ffmpeg-installer", `${platform}-${testArch}`, `ffmpeg${ext}`),
          // macOS 應用程式包路徑
          path.join(path.dirname(process.execPath), "..", "Resources", "@ffmpeg-installer", `${platform}-${testArch}`, `ffmpeg${ext}`),
          // 開發環境中的通用路徑
          path.join(process.cwd(), "node_modules", "@ffmpeg-installer", `${platform}-${testArch}`, `ffmpeg${ext}`),
        ];
      }

      for (const testPath of possiblePaths) {
        console.log("測試 FFmpeg 路徑:", testPath, "存在:", fs.existsSync(testPath));
        if (fs.existsSync(testPath)) {
          ffmpegPath = testPath;
          found = true;
          break;
        }
      }
    }

    if (!ffmpegPath) {
      throw new Error(`無法找到 FFmpeg 二進制檔案。平台: ${platform}, 架構: ${arch}, 嘗試的架構: ${architectures.join(", ")}`);
    }
  }

  console.log("FFmpeg 路徑:", ffmpegPath);

  if (!fs.existsSync(ffmpegPath)) {
    throw new Error(`FFmpeg 不存在: ${ffmpegPath}`);
  }

  return ffmpegPath;
}

function getFFprobePath(): string {
  let ffprobePath: string = "";

  try {
    // 嘗試在開發環境中載入模組
    const ffprobeInstaller = require("@ffprobe-installer/ffprobe");
    ffprobePath = ffprobeInstaller.path;

    // 處理打包後的路徑問題
    if (ffprobePath.includes("app.asar") && !ffprobePath.includes("app.asar.unpacked")) {
      ffprobePath = ffprobePath.replace("app.asar", "app.asar.unpacked");
    }
  } catch (error) {
    // 在打包環境中，直接構建路徑
    const platform = process.platform === "darwin" ? "darwin" : process.platform === "win32" ? "win32" : "linux";
    const arch = process.arch === "arm64" ? "arm64" : "x64";
    const ext = process.platform === "win32" ? ".exe" : "";

    // 嘗試多個可能的路徑和架構
    const architectures = [arch]; // 先嘗試當前架構
    if (arch === "x64" && platform === "darwin") {
      architectures.push("arm64"); // 只在 macOS 上嘗試 arm64（透過 Rosetta）
    }

    let found = false;
    for (const testArch of architectures) {
      if (found) break;

      let possiblePaths: string[] = [];

      if (platform === "win32") {
        possiblePaths = [
          // Windows extraResources 路徑
          path.join(process.resourcesPath, "@ffprobe-installer", `${platform}-${testArch}`, `ffprobe${ext}`),
          // Windows app.asar.unpacked 路徑
          path.join(process.resourcesPath, "app.asar.unpacked", "node_modules", "@ffprobe-installer", `${platform}-${testArch}`, `ffprobe${ext}`),
          // Windows 相對於可執行檔案的路徑
          path.join(path.dirname(process.execPath), "resources", "@ffprobe-installer", `${platform}-${testArch}`, `ffprobe${ext}`),
          // 開發環境中的通用路徑
          path.join(process.cwd(), "node_modules", "@ffprobe-installer", `${platform}-${testArch}`, `ffprobe${ext}`),
        ];
      } else {
        possiblePaths = [
          // extraResources 路徑
          path.join(process.resourcesPath, "@ffprobe-installer", `${platform}-${testArch}`, `ffprobe${ext}`),
          // app.asar.unpacked 路徑
          path.join(process.resourcesPath, "app.asar.unpacked", "node_modules", "@ffprobe-installer", `${platform}-${testArch}`, `ffprobe${ext}`),
          // macOS 應用程式包路徑
          path.join(path.dirname(process.execPath), "..", "Resources", "@ffprobe-installer", `${platform}-${testArch}`, `ffprobe${ext}`),
          // 開發環境中的通用路徑
          path.join(process.cwd(), "node_modules", "@ffprobe-installer", `${platform}-${testArch}`, `ffprobe${ext}`),
        ];
      }

      for (const testPath of possiblePaths) {
        console.log("測試 FFprobe 路徑:", testPath, "存在:", fs.existsSync(testPath));
        if (fs.existsSync(testPath)) {
          ffprobePath = testPath;
          found = true;
          break;
        }
      }
    }

    if (!ffprobePath) {
      throw new Error(`無法找到 FFprobe 二進制檔案。平台: ${platform}, 架構: ${arch}, 嘗試的架構: ${architectures.join(", ")}`);
    }
  }

  console.log("FFprobe 路徑:", ffprobePath);

  if (!fs.existsSync(ffprobePath)) {
    throw new Error(`FFprobe 不存在: ${ffprobePath}`);
  }

  return ffprobePath;
}

// ======== 壓縮影片 ========
export async function compressVideo(inputPath: string, vcodec = "libx264", crf = 28, resolution = "original", acodec = "aac", progressCallback?: (progress: number, estimatedTime?: string) => void, cancelToken?: CancelToken): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      if (!fs.existsSync(inputPath)) {
        return reject(new Error(`輸入檔案不存在: ${inputPath}`));
      }

      const videoInfo = await getVideoInfo(inputPath);
      const totalDuration = videoInfo.duration || 0;
      if (totalDuration === 0) {
        return reject(new Error("無法獲取影片時長"));
      }

      const inputDir = path.dirname(inputPath);
      const outputPath = path.join(inputDir, `${path.basename(inputPath, path.extname(inputPath))}_compressed${path.extname(inputPath)}`);

      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      const args: string[] = ["-i", inputPath];

      if (vcodec !== "copy") {
        args.push("-c:v", vcodec, "-crf", crf.toString());
      } else {
        args.push("-c:v", "copy");
      }

      if (resolution !== "original" && vcodec !== "copy") {
        const resMap: Record<string, string> = {
          "1080p": "scale=1920:1080",
          "720p": "scale=1280:720",
          "480p": "scale=854:480",
        };
        if (resMap[resolution]) {
          args.push("-vf", resMap[resolution]);
        }
      }

      if (acodec !== "copy") {
        args.push("-c:a", acodec, "-ac", "2", "-ar", "44100");
      } else {
        args.push("-c:a", "copy");
      }

      args.push("-preset", "medium", "-movflags", "+faststart", "-y", outputPath);

      const ffmpegPath = getFFmpegPath();
      console.log("執行 FFmpeg:", ffmpegPath);
      console.log("FFmpeg 參數:", args);

      const ffmpegProcess = spawn(ffmpegPath, args);
      if (cancelToken) cancelToken.process = ffmpegProcess;

      let lastProgress = 0;
      let lastTime = 0;

      ffmpegProcess.stderr.on("data", (data) => {
        const line = data.toString();

        if (cancelToken?.cancelled) {
          ffmpegProcess.kill("SIGKILL");
          return;
        }

        const matchTime = line.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
        const matchSpeed = line.match(/speed=\s*(\d+\.?\d*)x/);

        if (matchTime && progressCallback) {
          const currentTime = parseInt(matchTime[1]) * 3600 + parseInt(matchTime[2]) * 60 + parseFloat(matchTime[3]);
          const progress = Math.round((currentTime / totalDuration) * 100);

          if (progress > lastProgress && currentTime >= lastTime) {
            lastProgress = progress;
            lastTime = currentTime;

            let estimate = "";
            if (matchSpeed && progress > 0) {
              const speed = parseFloat(matchSpeed[1]);
              const remain = (totalDuration - currentTime) / speed;
              const min = Math.floor(remain / 60);
              const sec = Math.floor(remain % 60);
              estimate = `剩餘 ${min > 0 ? `${min}分${sec}秒` : `${sec}秒`} (${speed.toFixed(1)}x)`;
            }

            progressCallback(Math.min(progress, 100), estimate);
          }
        }
      });

      ffmpegProcess.on("close", (code) => {
        if (cancelToken?.cancelled) {
          return reject(new Error("壓縮已被取消"));
        }

        if (code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
          return resolve(outputPath);
        }

        reject(new Error("FFmpeg 壓縮失敗"));
      });

      ffmpegProcess.on("error", (err) => {
        reject(new Error(`FFmpeg 進程錯誤: ${err.message}`));
      });
    } catch (error) {
      reject(new Error(`壓縮失敗: ${error instanceof Error ? error.message : "未知錯誤"}`));
    }
  });
}

// ======== 取得影片資訊 ========
export function getVideoInfo(inputPath: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    try {
      const ffprobePath = getFFprobePath();
      const args = ["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", inputPath];

      console.log("執行 FFprobe:", ffprobePath);
      console.log("參數:", args);

      const ffprobeProcess = spawn(ffprobePath, args);

      let stdout = "";
      let stderr = "";

      ffprobeProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      ffprobeProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      ffprobeProcess.on("close", (code) => {
        console.log("FFprobe 退出碼:", code);
        if (stderr) console.log("FFprobe stderr:", stderr);

        if (code === 0 && stdout) {
          try {
            const metadata = JSON.parse(stdout);
            resolve({
              duration: parseFloat(metadata.format.duration) || 0,
              size: parseInt(metadata.format.size) || 0,
              format: metadata.format.format_name || "unknown",
            });
          } catch (err) {
            reject(new Error(`解析影片資訊失敗: ${err instanceof Error ? err.message : "未知錯誤"}`));
          }
        } else {
          reject(new Error(`FFprobe 執行失敗，退出碼: ${code}, stderr: ${stderr}`));
        }
      });

      ffprobeProcess.on("error", (err) => {
        console.error("FFprobe 進程錯誤:", err);
        reject(new Error(`FFprobe 進程錯誤: ${err.message}`));
      });
    } catch (pathError) {
      console.error("獲取 FFprobe 路徑時發生錯誤:", pathError);
      reject(new Error(`獲取 FFprobe 路徑失敗: ${pathError instanceof Error ? pathError.message : "未知錯誤"}`));
    }
  });
}
