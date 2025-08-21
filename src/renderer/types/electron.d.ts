declare global {
  interface Window {
    electronAPI: {
      selectVideoFile: () => Promise<string | null>;
      compressVideo: (data: { inputPath: string; vcodec: string; crf: number }) => Promise<{ success: boolean; outputPath?: string; error?: string }>;
      cancelCompression: () => Promise<{ success: boolean; error?: string }>;
      onCompressionProgress: (callback: (progress: number) => void) => void;
      onError: (callback: (error: string) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

export {};
