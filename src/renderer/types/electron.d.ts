declare global {
  interface Window {
    electronAPI: {
      selectVideoFile: () => Promise<string | null>;
      getVideoInfo: (filePath: string) => Promise<{
        duration: number;
        size: number;
        format: string;
      }>;
      compressVideo: (
        inputPath: string,
        vcodec: string,
        crf: number,
        resolution: string,
        acodec: string,
        progressCallback: (progress: number, estimatedTime?: string) => void
      ) => Promise<{
        outputPath: string;
        originalSize: number;
        compressedSize: number;
        compressionRatio: number;
      }>;
      cancelCompression: () => Promise<void>;
    };
  }
}

export {};
