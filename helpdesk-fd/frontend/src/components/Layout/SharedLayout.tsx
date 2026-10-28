import React from 'react';
import { Box } from '@mui/material';
import SharedSidebar, { type SharedSidebarProps } from './SharedSidebar';
import SharedNavbar from './SharedNavbar';

interface SharedLayoutProps extends SharedSidebarProps {
  children: React.ReactNode;
  aside?: React.ReactNode;
  asideCollapsed?: boolean;
}

const SharedLayout: React.FC<SharedLayoutProps> = ({ children, aside, asideCollapsed = false, ...sidebarProps }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#f4f5f7' }}>
      <SharedSidebar {...sidebarProps} />
      <Box
        component="main"
        sx={{
          flex: '1 1 0',
          minWidth: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'flex 0.3s ease',
        }}
      >
        <SharedNavbar />
        <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      </Box>
      <Box
        sx={{
          flexShrink: 0,
          width: aside && !asideCollapsed ? '30%' : 0,
          minWidth: aside && !asideCollapsed ? 300 : 0,
          maxWidth: aside && !asideCollapsed ? 480 : 0,
          height: '100vh',
          borderLeft: aside && !asideCollapsed ? '1px solid #e2e4ea' : 'none',
          bgcolor: '#fff',
          overflow: 'hidden',
          transition: 'width 0.3s ease, min-width 0.3s ease, max-width 0.3s ease',
          position: 'relative',
        }}
      >
        {aside}
      </Box>
    </Box>
  );
};

export default SharedLayout;
