import { useState, useCallback } from "react";
import { Container, Typography, Box, Grid, Alert } from "@mui/material";
import { VideoSelector } from "./components/VideoSelector";
import { CompressionSettings } from "./components/CompressionSettings";
import { CompressionProgress } from "./components/CompressionProgress";
import { CompressionResult } from "./components/CompressionResult";
import { Instructions } from "./components/Instructions";

interface VideoInfo {
  duration: number;
  size: number;
  format: string;
}

interface CompressionResult {
  outputPath: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export default function App() {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [vcodec, setVcodec] = useState<string>("libx264");
  const [crf, setCrf] = useState<number>(28);
  const [resolution, setResolution] = useState<string>("original");
  const [acodec, setAcodec] = useState<string>("aac");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<CompressionResult | null>(null);

  const handleFileSelect = useCallback(async () => {
    try {
      const filePath = await window.electronAPI.selectVideoFile();
      if (filePath) {
        setSelectedFilePath(filePath);
        setSelectedFileName(filePath.split("/").pop() || "");
        setError("");
        setResult(null);
        setProgress(0);
        setEstimatedTime("");

        try {
          const info = await window.electronAPI.getVideoInfo(filePath);
          setVideoInfo(info);
        } catch (err) {
          setError(`無法讀取影片資訊: ${err}`);
        }
      }
    } catch (err) {
      setError(`選擇檔案時發生錯誤: ${err}`);
    }
  }, []);

  const handleFileCancel = useCallback(() => {
    setSelectedFilePath(null);
    setSelectedFileName("");
    setVideoInfo(null);
    setError("");
    setResult(null);
    setProgress(0);
    setEstimatedTime("");
  }, []);

  const handleCompress = useCallback(async () => {
    if (!selectedFilePath) return;

    setIsCompressing(true);
    setProgress(0);
    setEstimatedTime("");
    setError("");
    setResult(null);

    try {
      const result = await window.electronAPI.compressVideo(selectedFilePath, vcodec, crf, resolution, acodec, (progress: number, estimatedTime?: string) => {
        setProgress(progress);
        if (estimatedTime) {
          setEstimatedTime(estimatedTime);
        }
      });

      setResult(result);
      setIsCompressing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "壓縮失敗");
      setIsCompressing(false);
    }
  }, [selectedFilePath, vcodec, crf, resolution, acodec]);

  const handleCancel = useCallback(async () => {
    try {
      await window.electronAPI.cancelCompression();
    } catch (err) {
      console.error("取消壓縮失敗:", err);
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* 標題區 */}
      <Box textAlign="center" mb={3}>
        <Typography variant="h2" component="h1" gutterBottom color="primary" fontWeight="bold">
          Vixel
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          專業影片壓縮工具
        </Typography>
        <Typography variant="body1" color="text.secondary">
          使用 FFmpeg 技術，提供高效能的影片壓縮解決方案
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 主要操作區域 */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* 影片選擇器 */}
          <VideoSelector selectedFilePath={selectedFilePath} selectedFileName={selectedFileName} videoInfo={videoInfo} isCompressing={isCompressing} onFileSelect={handleFileSelect} onFileCancel={handleFileCancel} formatDuration={formatDuration} formatFileSize={formatFileSize} />

          {/* 進度顯示 */}
          {isCompressing && <CompressionProgress progress={progress} estimatedTime={estimatedTime} />}

          {/* 壓縮設定 */}
          {selectedFilePath && <CompressionSettings vcodec={vcodec} acodec={acodec} resolution={resolution} crf={crf} isCompressing={isCompressing} hasSelectedFile={!!selectedFilePath} onVcodecChange={setVcodec} onAcodecChange={setAcodec} onResolutionChange={setResolution} onCrfChange={setCrf} onCompress={handleCompress} onCancel={handleCancel} />}

          {/* 錯誤顯示 */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* 結果顯示 */}
          {result && <CompressionResult result={result} formatFileSize={formatFileSize} />}
        </Grid>

        {/* 側邊欄 */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Instructions />
        </Grid>
      </Grid>
    </Container>
  );
}
