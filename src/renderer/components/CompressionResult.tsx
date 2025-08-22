import React from "react";
import { Paper, Typography, Box, Grid } from "@mui/material";
import { CheckCircle as CheckIcon } from "@mui/icons-material";

interface CompressionResultProps {
  result: {
    outputPath: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  };
  formatFileSize: (bytes: number) => string;
}

export const CompressionResult: React.FC<CompressionResultProps> = ({ result, formatFileSize }) => {
  return (
    <Paper elevation={3} sx={{ p: 4, mb: 2 }}>
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
  );
};
