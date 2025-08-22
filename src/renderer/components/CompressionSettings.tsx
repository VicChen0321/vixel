import React, { useState } from "react";
import { Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Box, Button, IconButton, Popover, List, ListItem, ListItemText, Divider } from "@mui/material";
import { PlayArrow as PlayIcon, Cancel as CancelIcon, Info as InfoIcon } from "@mui/icons-material";

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
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [infoType, setInfoType] = useState<string>("");

  const handleInfoClick = (event: React.MouseEvent<HTMLElement>, type: string) => {
    setAnchorEl(event.currentTarget);
    setInfoType(type);
  };

  const handleInfoClose = () => {
    setAnchorEl(null);
    setInfoType("");
  };

  const open = Boolean(anchorEl);

  const getInfoContent = () => {
    switch (infoType) {
      case "video":
        return (
          <Box sx={{ p: 2, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
              影片編碼器說明
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="H.264 (libx264)" secondary="最廣泛支援的編碼器，相容性最佳，壓縮速度快，適合一般用途" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="H.265 (libx265)" secondary="新一代高效編碼器，壓縮率最高，檔案最小，但需要較新設備支援" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="VP9 (libvpx-vp9)" secondary="Google 開發的開源編碼器，壓縮效率接近 H.265，無專利限制" />
              </ListItem>
            </List>
          </Box>
        );
      case "audio":
        return (
          <Box sx={{ p: 2, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
              音訊編碼器說明
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Copy (不重新編碼)" secondary="保持原始音訊不變，處理速度最快，但無法壓縮音訊" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="AAC" secondary="Apple 開發的高品質音訊編碼，相容性最佳，音質好檔案小" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="MP3" secondary="最廣泛支援的音訊格式，相容性極佳，但壓縮效率較低" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Opus" secondary="現代高效音訊編碼，音質高檔案小，但需要較新設備支援" />
              </ListItem>
            </List>
          </Box>
        );
      case "resolution":
        return (
          <Box sx={{ p: 2, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
              解析度說明
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="保持原解析度" secondary="保持影片原始解析度不變，品質最佳但檔案較大" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="1080p (1920x1080)" secondary="Full HD 解析度，適合大螢幕播放，平衡品質和檔案大小" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="720p (1280x720)" secondary="HD 解析度，適合一般用途，檔案大小適中" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="480p (854x480)" secondary="較低解析度，檔案最小，適合快速分享或儲存空間有限時使用" />
              </ListItem>
            </List>
          </Box>
        );
      case "crf":
        return (
          <Box sx={{ p: 2, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
              CRF 值說明
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="18 (無損)" secondary="無損品質，檔案極大，適合專業製作" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="20 (極高品質)" secondary="極高品質，檔案很大，適合高品質需求" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="23 (高品質)" secondary="高品質，檔案較大，推薦的起始值" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="26 (良好品質)" secondary="良好品質，檔案中等，平衡品質和大小" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="28 (一般品質)" secondary="一般品質，檔案較小，適合一般用途" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="30 (壓縮)" secondary="壓縮品質，檔案小，適合儲存空間有限" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="35 (高壓縮)" secondary="高壓縮，檔案很小，品質較低但節省空間" />
              </ListItem>
            </List>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        壓縮設定
      </Typography>

      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <FormControl fullWidth>
              <InputLabel>影片編碼器</InputLabel>
              <Select size="small" value={vcodec} label="影片編碼器" onChange={(e) => onVcodecChange(e.target.value)}>
                <MenuItem value="libx264">H.264 (libx264)</MenuItem>
                <MenuItem value="libx265">H.265 (libx265)</MenuItem>
                <MenuItem value="libvpx-vp9">VP9 (libvpx-vp9)</MenuItem>
              </Select>
            </FormControl>
            <IconButton size="small" onClick={(e) => handleInfoClick(e, "video")} color="primary">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <FormControl fullWidth>
              <InputLabel>音訊編碼器</InputLabel>
              <Select size="small" value={acodec} label="音訊編碼器" onChange={(e) => onAcodecChange(e.target.value)}>
                <MenuItem value="copy">Copy (不重新編碼)</MenuItem>
                <MenuItem value="aac">AAC</MenuItem>
                <MenuItem value="mp3">MP3</MenuItem>
                <MenuItem value="opus">Opus</MenuItem>
              </Select>
            </FormControl>
            <IconButton size="small" onClick={(e) => handleInfoClick(e, "audio")} color="primary">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <FormControl fullWidth>
              <InputLabel>解析度</InputLabel>
              <Select size="small" value={resolution} label="解析度" onChange={(e) => onResolutionChange(e.target.value)}>
                <MenuItem value="original">保持原解析度</MenuItem>
                <MenuItem value="1080p">1080p (1920x1080)</MenuItem>
                <MenuItem value="720p">720p (1280x720)</MenuItem>
                <MenuItem value="480p">480p (854x480)</MenuItem>
              </Select>
            </FormControl>
            <IconButton size="small" onClick={(e) => handleInfoClick(e, "resolution")} color="primary">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Box display="flex" alignItems="center" gap={1}>
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
            <IconButton size="small" onClick={(e) => handleInfoClick(e, "crf")} color="primary">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Box>
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

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleInfoClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {getInfoContent()}
      </Popover>
    </Paper>
  );
};
