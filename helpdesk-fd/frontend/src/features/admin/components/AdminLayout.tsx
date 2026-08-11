import React from 'react';
import { Box } from '@mui/material';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: '#f4f5f7' }}>
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
