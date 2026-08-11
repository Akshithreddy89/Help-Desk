import React, { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Divider, Chip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined as DashboardOutlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  PeopleOutlined as PeopleOutlineIcon,
  LogoutOutlined as LogoutOutlinedIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

const DRAWER_WIDTH_EXPANDED = 240;
const DRAWER_WIDTH_COLLAPSED = 72;

const AdminSidebar: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/admin/dashboard' },
    { title: 'Tickets', icon: <FormatListBulletedIcon />, path: '/admin/tickets' },
    { title: 'Agents', icon: <PeopleOutlineIcon />, path: '/admin/agents' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isSelected = (path: string) => location.pathname === path;

  return (
    <Box
      sx={{
        width: expanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED,
        flexShrink: 0,
        height: '100vh',
        bgcolor: '#111318',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s',
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: expanded ? 'space-between' : 'center', mb: 2 }}>
        {expanded && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>HelpDesk</Typography>
            <Chip label="ADMIN" size="small" sx={{ bgcolor: 'white', color: 'black', fontWeight: 'bold', height: 20, fontSize: '0.65rem' }} />
          </Box>
        )}
        <IconButton onClick={() => setExpanded(!expanded)} sx={{ color: 'white' }}>
          <MenuIcon />
        </IconButton>
      </Box>

      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: expanded ? 'initial' : 'center',
                px: 2.5,
                borderRadius: 2,
                bgcolor: isSelected(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.15)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: expanded ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {expanded && (
                <ListItemText 
                  primary={
                    <Typography sx={{ fontWeight: isSelected(item.path) ? 'bold' : 'normal', fontSize: '0.9rem' }}>
                      {item.title}
                    </Typography>
                  }
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <List sx={{ px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              minHeight: 48,
              justifyContent: expanded ? 'initial' : 'center',
              px: 2.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: expanded ? 2 : 'auto',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <LogoutOutlinedIcon />
            </ListItemIcon>
            {expanded && <ListItemText primary={<Typography sx={{ fontSize: '0.9rem' }}>Logout</Typography>} />}
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default AdminSidebar;
