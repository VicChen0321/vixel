/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

module.exports = async function cleanDeps(context) {
  const { packager, arch, appOutDir } = context;
  const platform = packager.platform.nodeName;

  const archMap = {
    1: "x64",
    3: "arm64",
  };
  const currentArch = archMap[arch];

  if (!currentArch) {
    return;
  }

  let resourcesPath;
  if (platform === "darwin") {
    resourcesPath = path.resolve(appOutDir, "Vixel.app", "Contents", "Resources");
  } else if (platform === "win32") {
    resourcesPath = path.resolve(appOutDir, "resources");
  } else {
    console.log(`Unsupported platform: ${platform}`);
    return;
  }

  if (!fs.existsSync(resourcesPath)) {
    console.log(`Resources path does not exist: ${resourcesPath}`);
    return;
  }

  const ffmpegPath = path.resolve(resourcesPath, "@ffmpeg-installer");
  const ffprobePath = path.resolve(resourcesPath, "@ffprobe-installer");

  if (!fs.existsSync(ffmpegPath) || !fs.existsSync(ffprobePath)) {
    console.log("FFmpeg or FFprobe directories not found, skipping cleanup");
    return;
  }

  const removeUnusedArch = (basePath, platformPrefix, unusedArch) => {
    const unusedPath = path.resolve(basePath, `${platformPrefix}-${unusedArch}`);
    if (fs.existsSync(unusedPath)) {
      fs.rmSync(unusedPath, { recursive: true });
      console.log(`Removed unused ${unusedArch} dependencies from ${basePath}`);
    }
  };

  if (platform === "darwin") {
    if (currentArch === "x64") {
      removeUnusedArch(ffmpegPath, "darwin", "arm64");
      removeUnusedArch(ffprobePath, "darwin", "arm64");
    } else if (currentArch === "arm64") {
      removeUnusedArch(ffmpegPath, "darwin", "x64");
      removeUnusedArch(ffprobePath, "darwin", "x64");
    }
  } else if (platform === "win32") {
    // Windows 目前只支援 x64，所以不需要清理其他架構
    console.log("Windows platform detected, no arch cleanup needed (x64 only)");
  }

  console.log("Cleaned unused arch dependencies.");
};
