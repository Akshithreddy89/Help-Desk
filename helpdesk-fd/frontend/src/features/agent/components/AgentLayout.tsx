import React from 'react';
import { Chip } from '@mui/material';
import { 
  DashboardOutlined as DashboardOutlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  EventAvailableOutlined as EventAvailableOutlinedIcon,
  CalendarMonthOutlined as CalendarMonthOutlinedIcon
} from '@mui/icons-material';
import SharedLayout from '../../../components/Layout/SharedLayout';

interface AgentLayoutProps {
  children: React.ReactNode;
}

const AgentLayout: React.FC<AgentLayoutProps> = ({ children }) => {
  const menuItems = [
    { title: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/agent/dashboard' },
    { title: 'My Tickets', icon: <FormatListBulletedIcon />, path: '/agent/my-tickets' },
    { title: 'Slots', icon: <EventAvailableOutlinedIcon />, path: '/agent/slots' },
    { title: 'Calendar', icon: <CalendarMonthOutlinedIcon />, path: '/agent/calendar' },
  ];

  const agentBadge = <Chip label="PRO" size="small" sx={{ bgcolor: 'white', color: 'black', fontWeight: 'bold', height: 20, fontSize: '0.65rem' }} />;

  return (
    <SharedLayout menuItems={menuItems} headerBadge={agentBadge}>
      {children}
    </SharedLayout>
  );
};

export default AgentLayout;
