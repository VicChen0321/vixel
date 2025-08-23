/* eslint-disable no-console */
const { exec } = require("node:child_process");
const os = require("node:os");

const platform = os.platform();

if (platform === "darwin") {
  console.log("Detected macOS, installing darwin dependencies...");
  // 為了在 macOS arm64 架構下進行打包 x64 架構的 APP, 所以需要同時安裝 x64 arm64 架構的 ffmpeg 和 ffprobe
  exec("npm i @ffmpeg-installer/darwin-x64 @ffprobe-installer/darwin-x64 @ffmpeg-installer/darwin-arm64 @ffprobe-installer/darwin-arm64 -D --force", (err, stdout, stderr) => {
    if (err) {
      console.error(`Error installing optional dependencies: ${stderr}`);
      throw new Error("Error installing optional dependencies");
    } else {
      console.log(`Optional dependencies installed: ${stdout}`);
    }
  });
} else {
  console.log("Non-macOS platform detected, skipping optional darwin installation.");
}
