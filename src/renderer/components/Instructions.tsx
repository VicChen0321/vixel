import React from "react";
import { Paper, Typography, Box, Chip, Stack } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";

export const Instructions: React.FC = () => {
  return (
    <Paper elevation={3} sx={{ p: 4, height: "fit-content" }}>
      <Typography variant="h6" gutterBottom>
        使用說明
      </Typography>

      <Stack spacing={2}>
        <Box sx={{ display: "flex", alignItems: "left" }}>
          <Chip label="1" color="primary" size="small" sx={{ mr: 1 }} />
          <Typography variant="body2">選擇要壓縮的影片檔案</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "left" }}>
          <Chip label="2" color="primary" size="small" sx={{ mr: 1 }} />
          <Typography variant="body2">設定影片編碼器、音訊編碼器、解析度和 CRF 值</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "left" }}>
          <Chip label="3" color="primary" size="small" sx={{ mr: 1 }} />
          <Typography variant="body2">點擊「開始壓縮」開始處理</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "left" }}>
          <Chip label="4" color="primary" size="small" sx={{ mr: 1 }} />
          <Typography variant="body2">壓縮完成後，輸出檔案會保存在原檔案同目錄下</Typography>
        </Box>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        <InfoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
        CRF 值越低品質越好，檔案越大。建議從 23~28 開始調整。
      </Typography>
    </Paper>
  );
};
