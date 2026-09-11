import React, { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogoutOutlined as LogoutOutlinedIcon,
  Menu as MenuIcon,
  HelpOutlined as HelpOutlineIcon
} from '@mui/icons-material';
import LogoutDialog from '../LogoutDialog';

const DRAWER_WIDTH_EXPANDED = 240;
const DRAWER_WIDTH_COLLAPSED = 72;

export interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
}

export interface SharedSidebarProps {
  menuItems: MenuItem[];
  headerBadge?: React.ReactNode;
  collapseIconType?: 'menu' | 'help';
}

const SharedSidebar: React.FC<SharedSidebarProps> = ({ menuItems, headerBadge, collapseIconType = 'menu' }) => {
  const [expanded, setExpanded] = useState(true);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    sessionStorage.setItem('toastMessage', 'Logged out successfully');
    setLogoutDialogOpen(false);
    navigate('/login');
  };

  const isSelected = (path: string) => location.pathname === path;

  return (
    <Box
      sx={{
        width: expanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED,
        flexShrink: 0,
        height: '100vh',
        bgcolor: 'primary.main',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s',
        overflowX: 'hidden',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: expanded ? 'space-between' : 'center', mb: 2, height: 64 }}>
        {collapseIconType === 'help' && !expanded ? (
           <IconButton onClick={() => setExpanded(!expanded)} sx={{ color: 'white', ml: -1 }}>
             <HelpOutlineIcon />
           </IconButton>
        ) : null}

        {expanded && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>HelpDesk</Typography>
            {headerBadge}
          </Box>
        )}
        
        {collapseIconType === 'menu' || expanded ? (
          <IconButton onClick={() => setExpanded(!expanded)} sx={{ color: 'white' }}>
            <MenuIcon />
          </IconButton>
        ) : null}
      </Box>

      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => {
          const active = isSelected(item.path);
          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: expanded ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  bgcolor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
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
                    color: active ? 'white' : 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography sx={{ fontWeight: active ? 'bold' : 'normal', fontSize: '0.9rem', color: active ? 'white' : 'rgba(255, 255, 255, 0.8)' }}>
                      {item.title}
                    </Typography>
                  }
                  sx={{
                    opacity: expanded ? 1 : 0,
                    display: expanded ? 'block' : 'none',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <List sx={{ px: 1, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogoutClick}
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
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <LogoutOutlinedIcon />
            </ListItemIcon>
            <ListItemText 
              primary={<Typography sx={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>Logout</Typography>} 
              sx={{
                opacity: expanded ? 1 : 0,
                display: expanded ? 'block' : 'none',
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

export default SharedSidebar;
