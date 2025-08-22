import React from "react";
import { Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Box, Button } from "@mui/material";
import { PlayArrow as PlayIcon, Cancel as CancelIcon } from "@mui/icons-material";

interface CompressionSettingsProps {
  vcodec: string;
  acodec: string;
  resolution: string;
  crf: number;
  isCompressing: boolean;
  hasSelectedFile: boolean;
  onVcodecChange: (value: string) => void;
  onAcodecChange: (value: string) => void;
  onResolutionChange: (value: string) => void;
  onCrfChange: (value: number) => void;
  onCompress: () => void;
  onCancel: () => void;
}

export const CompressionSettings: React.FC<CompressionSettingsProps> = ({ vcodec, acodec, resolution, crf, isCompressing, hasSelectedFile, onVcodecChange, onAcodecChange, onResolutionChange, onCrfChange, onCompress, onCancel }) => {
  return (
    <Paper elevation={3} sx={{ p: 4, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        壓縮設定
      </Typography>

      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>影片編碼器</InputLabel>
            <Select size="small" value={vcodec} label="影片編碼器" onChange={(e) => onVcodecChange(e.target.value)}>
              <MenuItem value="libx264">H.264 (libx264)</MenuItem>
              <MenuItem value="libx265">H.265 (libx265)</MenuItem>
              <MenuItem value="libvpx-vp9">VP9 (libvpx-vp9)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>音訊編碼器</InputLabel>
            <Select size="small" value={acodec} label="音訊編碼器" onChange={(e) => onAcodecChange(e.target.value)}>
              <MenuItem value="copy">Copy (不重新編碼)</MenuItem>
              <MenuItem value="aac">AAC</MenuItem>
              <MenuItem value="mp3">MP3</MenuItem>
              <MenuItem value="opus">Opus</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>解析度</InputLabel>
            <Select size="small" value={resolution} label="解析度" onChange={(e) => onResolutionChange(e.target.value)}>
              <MenuItem value="original">保持原解析度</MenuItem>
              <MenuItem value="1080p">1080p (1920x1080)</MenuItem>
              <MenuItem value="720p">720p (1280x720)</MenuItem>
              <MenuItem value="480p">480p (854x480)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>CRF 值</InputLabel>
            <Select size="small" value={crf} label="CRF 值" onChange={(e) => onCrfChange(e.target.value as number)}>
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

      <Box textAlign="center">
        {isCompressing ? (
          <Button variant="contained" color="error" size="large" startIcon={<CancelIcon />} onClick={onCancel} sx={{ px: 4, py: 1.5 }}>
            取消壓縮
          </Button>
        ) : (
          <Button variant="contained" size="large" startIcon={<PlayIcon />} onClick={onCompress} disabled={!hasSelectedFile} sx={{ px: 4, py: 1.5 }}>
            開始壓縮
          </Button>
        )}
      </Box>
    </Paper>
  );
};
