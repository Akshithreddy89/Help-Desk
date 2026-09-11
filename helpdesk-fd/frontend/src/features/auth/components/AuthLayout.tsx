import React from 'react';
import { Box, Grid, Typography, Stack } from '@mui/material';
import { CheckCircleOutlined as CheckCircleOutlineIcon, HelpOutlined as HelpOutlineIcon } from '@mui/icons-material';

interface AuthLayoutProps {
  children: React.ReactNode;
  type: 'login' | 'register';
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, type }) => {
  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Left Panel */}
      <Grid
        size={{ xs: 12, md: 5 }}
        sx={{
          backgroundColor: '#111315',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 4, md: 8 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 8 }}>
          <HelpOutlineIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            HelpDesk
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {type === 'login' ? (
            <>
              <Typography variant="overline" sx={{ color: '#888', mb: 2, letterSpacing: 1 }}>
                WHAT YOU GET
              </Typography>
              <Stack spacing={4}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#888', fontSize: 20, mr: 1 }} />
                    <Typography sx={{ fontWeight: 'bold' }}>Ticket Management</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#888', pl: 3.5 }}>
                    Create, assign, and resolve support tickets in one place.
                  </Typography>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#888', fontSize: 20, mr: 1 }} />
                    <Typography sx={{ fontWeight: 'bold' }}>Live Priority Queue</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#888', pl: 3.5 }}>
                    Auto-sort tickets by urgency so nothing gets missed.
                  </Typography>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#888', fontSize: 20, mr: 1 }} />
                    <Typography sx={{ fontWeight: 'bold' }}>Team Collaboration</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#888', pl: 3.5 }}>
                    Loop in colleagues and share ticket context instantly.
                  </Typography>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <CheckCircleOutlineIcon sx={{ color: '#888', fontSize: 20, mr: 1 }} />
                    <Typography sx={{ fontWeight: 'bold' }}>Analytics & Reports</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#888', pl: 3.5 }}>
                    Track resolution times and team performance.
                  </Typography>
                </Box>
              </Stack>
            </>
          ) : (
            <>
              <Typography variant="h3" sx={{ mb: 2, maxWidth: 400 }}>
                Support starts with a team.
              </Typography>
              <Typography variant="body1" sx={{ color: '#888', maxWidth: 400 }}>
                Create your account and join thousands of teams managing support at scale with HelpDesk.
              </Typography>
            </>
          )}
        </Box>

        <Typography variant="caption" sx={{ color: '#555', mt: 8 }}>
          © 2026 HelpDesk Inc. All rights reserved.
        </Typography>
      </Grid>

      {/* Right Panel */}
      <Grid
        size={{ xs: 12, md: 7 }}
        sx={{
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 4, md: 8 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 450 }}>
          {children}
        </Box>
      </Grid>
    </Grid>
  );
};

export default AuthLayout;
