import React from 'react';
import { Box, Typography } from '@mui/material';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="h4">This is admins page</Typography>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;
