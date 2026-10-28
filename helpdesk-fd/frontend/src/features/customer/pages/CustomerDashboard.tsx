import React, { lazy, Suspense, useState } from 'react';
import { Box, Fab, Tooltip, Zoom } from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import Typography from '@mui/material/Typography';
import CustomerLayout from '../components/CustomerLayout';

const AiAssistantPanel = lazy(() => import('../ai-assistant/components/AiAssistantPanel'));

const CustomerDashboard: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <CustomerLayout
      aside={
        open ? (
          <Suspense fallback={null}>
            <AiAssistantPanel onClose={() => setOpen(false)} />
          </Suspense>
        ) : undefined
      }
      asideCollapsed={false}
    >
      <Box sx={{ height: '100%', position: 'relative' }}>
        {/* Floating Ask AI Button — hides when panel is open */}
        <Zoom in={!open} timeout={200} unmountOnExit>
          <Tooltip title="Ask AI Assistant" placement="left">
            <Fab
              onClick={() => setOpen(true)}
              aria-label="Open AI Assistant"
              sx={{
                position: 'fixed',
                bottom: 32,
                right: 32,
                zIndex: 1200,
                bgcolor: 'primary.main',
                color: '#fff',
                width: 66,
                height: 66,
                boxShadow: '0 8px 24px rgba(25,118,210,0.35)',
                flexDirection: 'column',
                gap: 0.25,
                '&:hover': {
                  bgcolor: 'primary.main',
                  opacity: 0.92,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 28px rgba(25,118,210,0.45)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 26 }} />
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}
              >
                Ask AI
              </Typography>
            </Fab>
          </Tooltip>
        </Zoom>
      </Box>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
