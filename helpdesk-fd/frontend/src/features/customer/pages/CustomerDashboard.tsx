import React from 'react';
import { Box, Typography } from '@mui/material';
import CustomerLayout from '../components/CustomerLayout';

const CustomerDashboard: React.FC = () => {
  return (
    <CustomerLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Customer Dashboard</Typography>
        <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
          This is customers page
        </Typography>
      </Box>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
