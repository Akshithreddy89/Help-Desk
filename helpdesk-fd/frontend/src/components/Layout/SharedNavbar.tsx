import React, { useState } from 'react';
import { Box, Typography, Avatar, Menu, MenuItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { HelpOutlined as HelpOutlineIcon, Check as CheckIcon, Menu as MenuIcon } from '@mui/icons-material';
import { getInitials } from '../../utils/ticketHelpers';
import { useCustomTheme, THEME_COLORS, type ThemeColorName } from '../../theme/ThemeContext';

const SharedNavbar: React.FC = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const firstName = user?.first_name || 'Jane';
  const lastName = user?.last_name || 'Smith';
  const role = user?.role || 'Customer';
  
  const initials = getInitials(firstName, lastName);

  const { currentColor, setThemeColor } = useCustomTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (colorName: ThemeColorName) => {
    setThemeColor(colorName);
    handleClose();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 4,
        py: 0,
        bgcolor: '#f5f5f5',
        borderBottom: '1px solid #eaeaea',
        height: 64, // Matches the header height in sidebar
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Logo icon */}
        <Box 
          sx={{ 
            width: 28, 
            height: 28, 
            bgcolor: 'primary.main', 
            borderRadius: 1.5, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white'
          }}
        >
          <HelpOutlineIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.1rem' }}>
          HelpDesk
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar 
          sx={{ 
            bgcolor: 'primary.main', 
            width: 36, 
            height: 36, 
            fontSize: '0.9rem', 
            fontWeight: 'bold',
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2, color: 'primary.main' }}>
            {firstName} {lastName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', textTransform: 'capitalize', lineHeight: 1 }}>
            {role}
          </Typography>
        </Box>
        <IconButton onClick={handleClick} size="small" sx={{ ml: 1, color: 'primary.main' }}>
          <MenuIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
              mt: 1.5,
              minWidth: 150,
            },
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontWeight: 'bold' }}>
          Theme Color
        </Typography>
        {(Object.keys(THEME_COLORS) as ThemeColorName[]).map((colorName) => {
          const colorObj = THEME_COLORS[colorName];
          const isSelected = currentColor.name === colorName;
          
          return (
            <MenuItem key={colorName} onClick={() => handleThemeChange(colorName)}>
              <ListItemIcon>
                <Box 
                  sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    bgcolor: colorObj.main,
                    border: '1px solid #ccc'
                  }} 
                />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography sx={{ fontWeight: isSelected ? 'bold' : 'normal', fontSize: '0.875rem' }}>
                    {colorName}
                  </Typography>
                }
              />
              {isSelected && (
                <CheckIcon sx={{ ml: 2, fontSize: 18, color: 'primary.main' }} />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

export default SharedNavbar;
