import React from 'react';
import { Chip } from '@mui/material';
import { 
  DashboardOutlined as DashboardOutlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  PeopleOutlined as PeopleOutlineIcon
} from '@mui/icons-material';
import SharedLayout from '../../../components/Layout/SharedLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const menuItems = [
    { title: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/admin/dashboard' },
    { title: 'Tickets', icon: <FormatListBulletedIcon />, path: '/admin/tickets' },
    { title: 'Agents', icon: <PeopleOutlineIcon />, path: '/admin/agents' },
  ];

  const adminBadge = <Chip label="ADMIN" size="small" sx={{ bgcolor: 'white', color: 'black', fontWeight: 'bold', height: 20, fontSize: '0.65rem' }} />;

  return (
    <SharedLayout menuItems={menuItems} headerBadge={adminBadge}>
      {children}
    </SharedLayout>
  );
};

export default AdminLayout;
