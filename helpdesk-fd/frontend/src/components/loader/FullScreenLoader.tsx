import React from 'react';
import { Box, CircularProgress, type BoxProps } from '@mui/material';

const FullScreenLoader: React.FC<BoxProps> = (props) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        height: '100vh', 
        justifyContent: 'center', 
        alignItems: 'center', 
        bgcolor: 'background.default',
        ...props.sx
      }}
      {...props}
    >
      <CircularProgress />
    </Box>
  );
};

export default FullScreenLoader;
