declare module "ffprobe-static" {
  interface FFprobeStatic {
    path: string;
  }
  const ffprobeStatic: FFprobeStatic;
  export default ffprobeStatic;
}

declare module "ffmpeg-static" {
  interface FFmpegStatic {
    path?: string;
  }
  const ffmpegStatic: FFmpegStatic | string;
  export default ffmpegStatic;
}
