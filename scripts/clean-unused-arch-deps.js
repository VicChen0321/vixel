/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

module.exports = async function cleanDeps(context) {
  const { packager, arch, appOutDir } = context;
  const platform = packager.platform.nodeName;

  if (platform !== "darwin") {
    return;
  }

  const archMap = {
    1: "x64",
    3: "arm64",
  };
  const currentArch = archMap[arch];

  if (!currentArch) {
    return;
  }

  const resourcesPath = path.resolve(
    appOutDir,
    "Vixel.app", // 注意這裡改為您的應用程式名稱
    "Contents",
    "Resources"
  );

  if (!fs.existsSync(resourcesPath)) {
    return;
  }

  const ffmpegPath = path.resolve(resourcesPath, "@ffmpeg-installer");
  const ffprobePath = path.resolve(resourcesPath, "@ffprobe-installer");

  if (!fs.existsSync(ffmpegPath) || !fs.existsSync(ffprobePath)) {
    return;
  }

  const removeUnusedArch = (basePath, unusedArch) => {
    const unusedPath = path.resolve(basePath, `darwin-${unusedArch}`);
    if (fs.existsSync(unusedPath)) {
      fs.rmSync(unusedPath, { recursive: true });
      console.log(`Removed unused ${unusedArch} dependencies from ${basePath}`);
    }
  };

  if (currentArch === "x64") {
    removeUnusedArch(ffmpegPath, "arm64");
    removeUnusedArch(ffprobePath, "arm64");
  } else if (currentArch === "arm64") {
    removeUnusedArch(ffmpegPath, "x64");
    removeUnusedArch(ffprobePath, "x64");
  }

  console.log("Cleaned unused arch dependencies.");
};
