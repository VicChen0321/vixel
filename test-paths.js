// 測試路徑解析
const path = require("path");
const fs = require("fs");

console.log("當前平台:", process.platform);
console.log("當前架構:", process.arch);

// 測試 FFmpeg 路徑
try {
  const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
  console.log("FFmpeg 路徑:", ffmpegInstaller.path);
  console.log("FFmpeg 存在:", fs.existsSync(ffmpegInstaller.path));
} catch (error) {
  console.log("FFmpeg 模組載入失敗:", error.message);
}

// 測試 FFprobe 路徑
try {
  const ffprobeInstaller = require("@ffprobe-installer/ffprobe");
  console.log("FFprobe 路徑:", ffprobeInstaller.path);
  console.log("FFprobe 存在:", fs.existsSync(ffprobeInstaller.path));
} catch (error) {
  console.log("FFprobe 模組載入失敗:", error.message);
}

// 測試所有已安裝的架構
console.log("\n已安裝的 FFmpeg 架構:");
const ffmpegDir = path.join(__dirname, "node_modules", "@ffmpeg-installer");
if (fs.existsSync(ffmpegDir)) {
  const dirs = fs.readdirSync(ffmpegDir).filter((d) => fs.statSync(path.join(ffmpegDir, d)).isDirectory() && d !== "ffmpeg");
  dirs.forEach((dir) => {
    const binPath = path.join(ffmpegDir, dir, process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");
    console.log(`  ${dir}: ${fs.existsSync(binPath) ? "✓" : "✗"}`);
  });
}

console.log("\n已安裝的 FFprobe 架構:");
const ffprobeDir = path.join(__dirname, "node_modules", "@ffprobe-installer");
if (fs.existsSync(ffprobeDir)) {
  const dirs = fs.readdirSync(ffprobeDir).filter((d) => fs.statSync(path.join(ffprobeDir, d)).isDirectory() && d !== "ffprobe");
  dirs.forEach((dir) => {
    const binPath = path.join(ffprobeDir, dir, process.platform === "win32" ? "ffprobe.exe" : "ffprobe");
    console.log(`  ${dir}: ${fs.existsSync(binPath) ? "✓" : "✗"}`);
  });
}
