import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ContentCopy, Link as LinkIcon } from '@mui/icons-material';
import type { MeetingLinkResponse } from '../../services/availability.service';

interface PublicMeetingLinkProps {
  meetingLink: MeetingLinkResponse | null;
  onCopy: () => void;
}

const PublicMeetingLink: React.FC<PublicMeetingLinkProps> = ({ meetingLink, onCopy }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, px: 3, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
        <LinkIcon fontSize="small" sx={{ transform: 'rotate(-45deg)' }} />
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {meetingLink?.url || 'Generating link...'}
        </Typography>
      </Box>
      <Button
        variant="contained"
        size="small"
        onClick={onCopy}
        startIcon={<ContentCopy fontSize="small" />}
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText', 
          textTransform: 'none',
          borderRadius: 1.5,
          '&:hover': { bgcolor: 'primary.dark' }
        }}
      >
        Copy Link
      </Button>
    </Box>
  );
};

export default PublicMeetingLink;
