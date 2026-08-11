import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 4, overflowY: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};

export default CustomerLayout;
