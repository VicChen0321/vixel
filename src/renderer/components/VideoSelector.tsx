import React from "react";
import { Paper, Typography, Button, Box, Card, CardContent, IconButton } from "@mui/material";
import { CloudUpload as UploadIcon, Cancel as CancelIcon } from "@mui/icons-material";

interface VideoInfo {
  duration: number;
  size: number;
  format: string;
}

interface VideoSelectorProps {
  selectedFilePath: string | null;
  selectedFileName: string;
  videoInfo: VideoInfo | null;
  isCompressing: boolean;
  onFileSelect: () => void;
  onFileCancel: () => void;
  formatDuration: (seconds: number) => string;
  formatFileSize: (bytes: number) => string;
}

export const VideoSelector: React.FC<VideoSelectorProps> = ({ selectedFilePath, selectedFileName, videoInfo, isCompressing, onFileSelect, onFileCancel, formatDuration, formatFileSize }) => {
  return (
    <Paper elevation={3} sx={{ p: 4, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        影片選擇
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<UploadIcon />} size="medium" fullWidth sx={{ py: 2 }} onClick={onFileSelect}>
          選擇影片檔案
        </Button>
      </Box>

      {selectedFilePath && (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedFileName}
                </Typography>
                {videoInfo && (
                  <Typography variant="body2" color="text.secondary">
                    {formatDuration(videoInfo.duration)} • {formatFileSize(videoInfo.size)} • {videoInfo.format}
                  </Typography>
                )}
              </Box>
              <IconButton onClick={onFileCancel} color="error" disabled={isCompressing} title={isCompressing ? "壓縮中無法取消選擇" : "取消選擇"}>
                <CancelIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      )}
    </Paper>
  );
};
