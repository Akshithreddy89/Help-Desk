import React from 'react';
import { Box } from '@mui/material';
import { 
  DashboardOutlined as DashboardOutlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  PersonOutlined as PersonOutlineIcon
} from '@mui/icons-material';
import SharedLayout from '../../../components/Layout/SharedLayout';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const menuItems = [
    { title: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/customer/dashboard' },
    { title: 'My Tickets', icon: <FormatListBulletedIcon />, path: '/customer/tickets' },
    { title: 'Profile', icon: <PersonOutlineIcon />, path: '/customer/profile' },
  ];

  return (
    <SharedLayout menuItems={menuItems} collapseIconType="help">
      <Box sx={{ p: 4, height: '100%', boxSizing: 'border-box' }}>
        {children}
      </Box>
    </SharedLayout>
  );
};

export default CustomerLayout;
