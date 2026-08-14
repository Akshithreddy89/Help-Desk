import React, { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined as DashboardOutlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  PersonOutlined as PersonOutlineIcon,
  LogoutOutlined as LogoutOutlinedIcon,
  HelpOutlined as HelpOutlineIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import LogoutDialog from '../../../components/LogoutDialog';

const DRAWER_WIDTH_EXPANDED = 240;
const DRAWER_WIDTH_COLLAPSED = 72;

const Sidebar: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/customer/dashboard' },
    { title: 'My Tickets', icon: <FormatListBulletedIcon />, path: '/customer/tickets' },
    { title: 'Profile', icon: <PersonOutlineIcon />, path: '/customer/profile' },
  ];

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.setItem('toastMessage', 'Logged out successfully');
    setLogoutDialogOpen(false);
    navigate('/login');
  };

  const drawerWidth = expanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED;

  return (
    <Box
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        height: '100vh',
        backgroundColor: '#111315',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        overflowX: 'hidden',
      }}
    >
      {/* Header Area */}
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, height: 64 }}>
        <IconButton onClick={() => setExpanded(!expanded)} sx={{ color: '#fff', mr: expanded ? 1 : 0 }}>
          {expanded ? <HelpOutlineIcon /> : <MenuIcon />}
        </IconButton>
        {expanded && (
          <Typography variant="h6" sx={{ fontWeight: 'bold' }} noWrap>
            HelpDesk
          </Typography>
        )}
      </Box>

      {/* Nav Links */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  justifyContent: expanded ? 'initial' : 'center',
                  px: 2.5,
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: expanded ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive ? '#fff' : '#aaa',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  sx={{
                    opacity: expanded ? 1 : 0,
                    display: expanded ? 'block' : 'none',
                    color: isActive ? '#fff' : '#aaa',
                    '& .MuiTypography-root': {
                      fontWeight: isActive ? 600 : 400,
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Footer / Logout */}
      <List sx={{ px: 1, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogoutClick}
            sx={{
              borderRadius: 2,
              justifyContent: expanded ? 'initial' : 'center',
              px: 2.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: expanded ? 2 : 'auto',
                justifyContent: 'center',
                color: '#aaa',
              }}
            >
              <LogoutOutlinedIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{
                opacity: expanded ? 1 : 0,
                display: expanded ? 'block' : 'none',
                color: '#aaa',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <LogoutDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </Box>
  );
};

export default Sidebar;
