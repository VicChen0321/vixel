import React from "react";
import { Paper, Typography, Box, LinearProgress } from "@mui/material";

interface CompressionProgressProps {
  progress: number;
  estimatedTime: string;
}

export const CompressionProgress: React.FC<CompressionProgressProps> = ({ progress, estimatedTime }) => {
  return (
    <Paper elevation={3} sx={{ p: 4, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        壓縮進度
      </Typography>

      <Box sx={{ mb: 2 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {progress.toFixed(1)}% 完成
        </Typography>
        {estimatedTime && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {estimatedTime}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
