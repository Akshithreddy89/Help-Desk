import React from 'react';
import { Box } from '@mui/material';
import SharedSidebar, { type SharedSidebarProps } from './SharedSidebar';
import SharedNavbar from './SharedNavbar';

interface SharedLayoutProps extends SharedSidebarProps {
  children: React.ReactNode;
}

const SharedLayout: React.FC<SharedLayoutProps> = ({ children, ...sidebarProps }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#f4f5f7' }}>
      <SharedSidebar {...sidebarProps} />
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <SharedNavbar />
        <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default SharedLayout;
