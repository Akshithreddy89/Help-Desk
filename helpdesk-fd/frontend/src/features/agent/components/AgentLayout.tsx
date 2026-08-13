import React from 'react';
import { Box } from '@mui/material';
import AgentSidebar from './AgentSidebar';

interface AgentLayoutProps {
  children: React.ReactNode;
}

const AgentLayout: React.FC<AgentLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AgentSidebar />
      <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f4f5f7' }}>
        {children}
      </Box>
    </Box>
  );
};

export default AgentLayout;
