import React, { useState, useCallback } from "react";
import { Container, Paper, Typography, Button, Box, LinearProgress, FormControl, InputLabel, Select, MenuItem, Alert, Card, CardContent, Grid, IconButton, Chip, Divider, Stack } from "@mui/material";
import { PlayArrow as PlayIcon, Cancel as CancelIcon, CloudUpload as UploadIcon, CheckCircle as CheckIcon, Info as InfoIcon } from "@mui/icons-material";

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

const App: React.FC = () => {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [vcodec, setVcodec] = useState<string>("libx264");
  const [crf, setCrf] = useState<number>(23);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<CompressionResult | null>(null);

  const handleFileSelect = useCallback(async () => {
    try {
      const filePath = await window.electronAPI.selectVideoFile();
      if (filePath) {
        const fileName = filePath.split("/").pop() || filePath.split("\\").pop() || "";
        setSelectedFilePath(filePath);
        setSelectedFileName(fileName);
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

  const handleCompress = useCallback(async () => {
    if (!selectedFilePath) return;

    setIsCompressing(true);
    setError("");
    setResult(null);
    setProgress(0);
    setEstimatedTime("");

    try {
      const result = await window.electronAPI.compressVideo(selectedFilePath, vcodec, crf, (progress: number, estimatedTime?: string) => {
        setProgress(progress);
        if (estimatedTime) {
          setEstimatedTime(estimatedTime);
        }
      });
      setResult(result);
    } catch (err) {
      setError(`壓縮失敗: ${err}`);
    } finally {
      setIsCompressing(false);
    }
  }, [selectedFilePath, vcodec, crf]);

  const handleCancel = useCallback(async () => {
    try {
      await window.electronAPI.cancelCompression();
    } catch (err) {
      console.error("取消壓縮失敗:", err);
    }
  }, []);

  const getCrfDescription = () => {
    if (crf <= 18) return "無損品質";
    if (crf <= 23) return "高品質";
    if (crf <= 28) return "良好品質";
    if (crf <= 35) return "一般品質";
    return "低品質";
  };

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
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

      <Grid container spacing={4}>
        {/* 主要操作區域 */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              影片選擇
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Button variant="outlined" startIcon={<UploadIcon />} size="large" fullWidth sx={{ py: 2 }} onClick={handleFileSelect}>
                選擇影片檔案
              </Button>
            </Box>

            {selectedFilePath && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {selectedFileName}
                      </Typography>
                      {videoInfo && (
                        <Typography variant="body2" color="text.secondary">
                          {formatDuration(videoInfo.duration)} • {formatFileSize(videoInfo.size)}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      onClick={() => {
                        setSelectedFilePath(null);
                        setSelectedFileName("");
                        setVideoInfo(null);
                        setError("");
                        setResult(null);
                        setProgress(0);
                        setEstimatedTime("");
                      }}
                      color="error"
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            )}

            {selectedFilePath && (
              <>
                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  壓縮設定
                </Typography>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>影片編碼器</InputLabel>
                      <Select value={vcodec} label="影片編碼器" onChange={(e) => setVcodec(e.target.value)}>
                        <MenuItem value="libx264">H.264 (libx264)</MenuItem>
                        <MenuItem value="libx265">H.265 (libx265)</MenuItem>
                        <MenuItem value="libvpx-vp9">VP9 (libvpx-vp9)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>CRF 值</InputLabel>
                      <Select value={crf} label="CRF 值" onChange={(e) => setCrf(e.target.value as number)}>
                        <MenuItem value={18}>18 (無損)</MenuItem>
                        <MenuItem value={20}>20 (極高品質)</MenuItem>
                        <MenuItem value={23}>23 (高品質)</MenuItem>
                        <MenuItem value={26}>26 (良好品質)</MenuItem>
                        <MenuItem value={28}>28 (一般品質)</MenuItem>
                        <MenuItem value={30}>30 (壓縮)</MenuItem>
                        <MenuItem value={35}>35 (高壓縮)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>CRF {crf}</strong> - {getCrfDescription()}
                  </Typography>
                </Alert>

                <Box textAlign="center">
                  {isCompressing ? (
                    <Button variant="contained" color="error" size="large" startIcon={<CancelIcon />} onClick={handleCancel} sx={{ px: 4, py: 1.5 }}>
                      取消壓縮
                    </Button>
                  ) : (
                    <Button variant="contained" size="large" startIcon={<PlayIcon />} onClick={handleCompress} disabled={!selectedFilePath} sx={{ px: 4, py: 1.5 }}>
                      開始壓縮
                    </Button>
                  )}
                </Box>
              </>
            )}
          </Paper>

          {/* 進度顯示 */}
          {isCompressing && (
            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                壓縮進度
              </Typography>

              <Box sx={{ mb: 2 }}>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {progress.toFixed(1)}% 完成
                </Typography>
              </Box>

              {estimatedTime && (
                <Typography variant="body2" color="text.secondary">
                  預估剩餘時間: {estimatedTime}
                </Typography>
              )}
            </Paper>
          )}

          {/* 錯誤顯示 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* 結果顯示 */}
          {result && (
            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <CheckIcon color="success" />
                <Typography variant="h6" color="success.main">
                  壓縮完成！
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    原始大小
                  </Typography>
                  <Typography variant="h6">{formatFileSize(result.originalSize)}</Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    壓縮後大小
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatFileSize(result.compressedSize)}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, p: 2, bgcolor: "success.light", borderRadius: 1 }}>
                <Typography variant="body2" color="success.dark">
                  壓縮率: {result.compressionRatio.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="success.dark" sx={{ mt: 1 }}>
                  輸出檔案: {result.outputPath}
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* 側邊說明區域 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ p: 4, position: "sticky", top: 24 }}>
            <Typography variant="h6" gutterBottom>
              使用說明
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Chip label="1" color="primary" size="small" sx={{ mr: 1 }} />
                <Typography variant="body2">選擇要壓縮的影片檔案</Typography>
              </Box>

              <Box>
                <Chip label="2" color="primary" size="small" sx={{ mr: 1 }} />
                <Typography variant="body2">設定影片編碼器和 CRF 值</Typography>
              </Box>

              <Box>
                <Chip label="3" color="primary" size="small" sx={{ mr: 1 }} />
                <Typography variant="body2">點擊「開始壓縮」開始處理</Typography>
              </Box>

              <Box>
                <Chip label="4" color="primary" size="small" sx={{ mr: 1 }} />
                <Typography variant="body2">壓縮完成後，輸出檔案會保存在原檔案同目錄下</Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="text.secondary">
              <InfoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
              CRF 值越低品質越好，檔案越大。建議從 23 開始調整。
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;
