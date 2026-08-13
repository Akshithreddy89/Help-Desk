import React from 'react';
import { Box, Typography } from '@mui/material';
import AgentLayout from '../components/AgentLayout';

const AgentDashboard: React.FC = () => {
  return (
    <AgentLayout>
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="h4">This is agent dashboard</Typography>
      </Box>
    </AgentLayout>
  );
};

export default AgentDashboard;
