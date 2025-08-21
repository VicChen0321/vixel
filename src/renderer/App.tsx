import React, { useState, useEffect } from "react";
import { Container, Paper, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Box, LinearProgress, Alert, Card, CardContent, Grid, Chip } from "@mui/material";
import { VideoFile as VideoFileIcon, Compress as CompressIcon, Settings as SettingsIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon } from "@mui/icons-material";

interface CompressionSettings {
  vcodec: string;
  crf: number;
}

interface CompressionResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [settings, setSettings] = useState<CompressionSettings>({
    vcodec: "libx264",
    crf: 23,
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 監聽壓縮進度和錯誤
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onCompressionProgress((progressValue: number) => {
        setProgress(progressValue);
      });

      window.electronAPI.onError((errorMessage: string) => {
        setError(errorMessage);
        setIsCompressing(false);
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners("compression-progress");
        window.electronAPI.removeAllListeners("error");
      }
    };
  }, []);

  const handleFileSelect = async () => {
    try {
      const filePath = await window.electronAPI.selectVideoFile();
      if (filePath) {
        setSelectedFile(filePath);
        setFileName(filePath.split("/").pop() || filePath.split("\\").pop() || "");
        setResult(null);
        setError(null);
        setProgress(0);
      }
    } catch (err) {
      setError("選擇檔案時發生錯誤");
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) {
      setError("請先選擇影片檔案");
      return;
    }

    console.log("前端：開始壓縮，設置 isCompressing = true");
    setIsCompressing(true);
    setProgress(0);
    setResult(null);
    setError(null);

    try {
      console.log("前端：調用 electronAPI.compressVideo");
      const result = await window.electronAPI.compressVideo({
        inputPath: selectedFile,
        vcodec: settings.vcodec,
        crf: settings.crf,
      });

      console.log("前端：壓縮完成，結果:", result);
      setResult(result);
      if (!result.success) {
        setError(result.error || "壓縮失敗");
        setIsCompressing(false);
        console.log("前端：壓縮失敗，設置 isCompressing = false");
      } else {
        // 壓縮成功，自動重置狀態
        setIsCompressing(false);
        console.log("前端：壓縮成功，設置 isCompressing = false");
      }
    } catch (err) {
      console.error("前端：壓縮錯誤:", err);
      setError("壓縮過程中發生錯誤");
      setIsCompressing(false);
      console.log("前端：壓縮錯誤，設置 isCompressing = false");
    }
  };

  const handleCancel = async () => {
    try {
      console.log("前端：開始取消流程");
      console.log("前端：當前壓縮狀態:", isCompressing);
      console.log("前端：發送取消壓縮請求");

      const result = await window.electronAPI.cancelCompression();
      console.log("前端：取消壓縮結果:", result);

      if (result.success) {
        setIsCompressing(false);
        setProgress(0);
        setError("壓縮已被取消");
        console.log("前端：已更新 UI 狀態");
      } else {
        setError(result.error || "取消壓縮失敗");
        console.log("前端：取消失敗:", result.error);
      }
    } catch (err) {
      console.error("前端：取消壓縮時發生錯誤:", err);
      setError("取消壓縮時發生錯誤");
    }
  };

  const handleSettingsChange = (field: keyof CompressionSettings, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getVcodecOptions = () => [
    { value: "libx264", label: "H.264 (libx264)" },
    { value: "libx265", label: "H.265/HEVC (libx265)" },
    { value: "libvpx-vp9", label: "VP9 (libvpx-vp9)" },
    { value: "copy", label: "複製 (不重新編碼)" },
  ];

  const getCrfDescription = () => {
    if (settings.vcodec === "libx264") {
      return "CRF 值範圍：0-51，0 為無損，23 為預設，51 為最差品質";
    } else if (settings.vcodec === "libx265") {
      return "CRF 值範圍：0-51，0 為無損，28 為預設，51 為最差品質";
    } else if (settings.vcodec === "libvpx-vp9") {
      return "CRF 值範圍：0-63，0 為無損，31 為預設，63 為最差品質";
    }
    return "CRF 值不適用於此編碼器";
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        <CompressIcon sx={{ mr: 2, verticalAlign: "middle" }} />
        FFmpeg 影片壓縮工具
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <VideoFileIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          選擇影片檔案
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Button variant="contained" onClick={handleFileSelect} disabled={isCompressing} startIcon={<VideoFileIcon />}>
            選擇影片檔案
          </Button>

          {selectedFile && (
            <Chip
              label={fileName}
              color="primary"
              variant="outlined"
              onDelete={() => {
                setSelectedFile(null);
                setFileName("");
                setResult(null);
              }}
            />
          )}
        </Box>

        {selectedFile && (
          <Typography variant="body2" color="text.secondary">
            已選擇：{selectedFile}
          </Typography>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <SettingsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          壓縮設定
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>影片編碼器</InputLabel>
              <Select value={settings.vcodec} label="影片編碼器" onChange={(e) => handleSettingsChange("vcodec", e.target.value)} disabled={isCompressing}>
                {getVcodecOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="CRF 值"
              type="number"
              value={settings.crf}
              onChange={(e) => handleSettingsChange("crf", Number(e.target.value))}
              disabled={isCompressing}
              inputProps={{
                min: 0,
                max: settings.vcodec === "libvpx-vp9" ? 63 : 51,
                step: 1,
              }}
              helperText={getCrfDescription()}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          {/* 調試信息 */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            調試信息: isCompressing = {isCompressing.toString()}, progress = {progress}%
          </Typography>

          {isCompressing ? (
            <Button variant="outlined" color="error" size="large" onClick={handleCancel} startIcon={<ErrorIcon />} fullWidth>
              取消壓縮
            </Button>
          ) : (
            <Button variant="contained" color="primary" size="large" onClick={handleCompress} disabled={!selectedFile} startIcon={<CompressIcon />} fullWidth>
              開始壓縮
            </Button>
          )}
        </Box>
      </Paper>

      {/* 進度顯示 */}
      {isCompressing && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            壓縮進度
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
          <Typography variant="body2" sx={{ mt: 1, textAlign: "center" }}>
            {progress}% 完成
          </Typography>
        </Paper>
      )}

      {/* 錯誤顯示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <ErrorIcon sx={{ mr: 1 }} />
          {error}
        </Alert>
      )}

      {/* 結果顯示 */}
      {result && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            壓縮結果
          </Typography>

          {result.success ? (
            <Card variant="outlined" sx={{ bgcolor: "success.light" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="success.dark">
                    壓縮成功！
                  </Typography>
                </Box>
                <Typography variant="body1" gutterBottom>
                  輸出檔案：
                </Typography>
                <Typography variant="body2" component="code" sx={{ bgcolor: "white", p: 1, borderRadius: 1 }}>
                  {result.outputPath}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ bgcolor: "error.light" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <ErrorIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="error.dark">
                    壓縮失敗
                  </Typography>
                </Box>
                <Typography variant="body1">錯誤：{result.error}</Typography>
              </CardContent>
            </Card>
          )}
        </Paper>
      )}

      {/* 使用說明 */}
      <Paper elevation={1} sx={{ p: 2, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          使用說明
        </Typography>
        <Typography variant="body2" paragraph>
          1. 點擊「選擇影片檔案」按鈕選擇要壓縮的影片
        </Typography>
        <Typography variant="body2" paragraph>
          2. 設定影片編碼器和 CRF 值（CRF 值越低品質越好，檔案越大）
        </Typography>
        <Typography variant="body2" paragraph>
          3. 點擊「開始壓縮」開始處理
        </Typography>
        <Typography variant="body2">4. 壓縮完成後，輸出檔案會保存在原檔案同目錄下，檔名會加上「_compressed」後綴</Typography>
      </Paper>
    </Container>
  );
};

export default App;
