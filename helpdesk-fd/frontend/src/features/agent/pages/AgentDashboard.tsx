import React from 'react';
import { Box, Typography } from '@mui/material';

const AgentDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Typography variant="h4">This is agent page</Typography>
    </Box>
  );
};

export default AgentDashboard;
