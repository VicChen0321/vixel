/* eslint-disable no-console */
const { exec } = require("node:child_process");
const os = require("node:os");

const platform = os.platform();

if (platform === "win32" || process.env.BUILD_WIN) {
  console.log("Installing Windows dependencies...");
  // 為了在任何平台上打包 Windows 版本，安裝 Windows 架構的 ffmpeg 和 ffprobe
  exec("npm i @ffmpeg-installer/win32-x64 @ffprobe-installer/win32-x64 -D --force", (err, stdout, stderr) => {
    if (err) {
      console.error(`Error installing Windows dependencies: ${stderr}`);
      throw new Error("Error installing Windows dependencies");
    } else {
      console.log(`Windows dependencies installed: ${stdout}`);
    }
  });
} else {
  console.log("Non-Windows platform detected, skipping Windows installation.");
}
