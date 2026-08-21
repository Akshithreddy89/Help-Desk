import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { HelpOutlined as HelpOutlineIcon } from '@mui/icons-material';
import { getInitials } from '../../utils/ticketHelpers';

const SharedNavbar: React.FC = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const firstName = user?.first_name || 'Jane';
  const lastName = user?.last_name || 'Smith';
  const role = user?.role || 'Customer';
  
  const initials = getInitials(firstName, lastName);

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
            bgcolor: '#111318', 
            borderRadius: 1.5, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white'
          }}
        >
          <HelpOutlineIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111318', fontSize: '1.1rem' }}>
          HelpDesk
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#111318', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 'bold' }}>
          {initials}
        </Avatar>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2, color: '#111318' }}>
            {firstName} {lastName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', textTransform: 'capitalize', lineHeight: 1 }}>
            {role}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SharedNavbar;
