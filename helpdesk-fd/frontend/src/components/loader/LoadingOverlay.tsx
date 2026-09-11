import React from 'react';
import { Box, CircularProgress, type BoxProps } from '@mui/material';

export interface LoadingOverlayProps extends BoxProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, sx, ...props }) => {
  if (!isLoading) return null;

  return (
    <Box 
      sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: 'rgba(255,255,255,0.7)', 
        zIndex: 10,
        ...sx 
      }}
      {...props}
    >
      <CircularProgress />
    </Box>
  );
};

export default LoadingOverlay;
