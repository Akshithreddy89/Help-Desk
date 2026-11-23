import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Avatar, Grid } from '@mui/material';
import CustomerLayout from '../components/CustomerLayout';
import EditProfileDialog from '../components/EditProfileDialog';
import SetPasswordDialog from '../components/SetPasswordDialog';
import { useCustomerProfile } from '../hooks/useCustomerProfile';

const CustomerProfile: React.FC = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // React Query hook for customer profile caching & automatic invalidation
  const { data: profile, isLoading, error } = useCustomerProfile();

  const errorMessage = error instanceof Error ? error.message : error ? 'Failed to load profile data.' : null;

  return (
    <CustomerLayout>
      <Box sx={{ p: 3, width: '100%', boxSizing: 'border-box' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorMessage ? (
          <Alert severity="error">{errorMessage}</Alert>
        ) : profile ? (
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            
            {/* Header Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {profile.first_name} {profile.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {profile.role.toLowerCase()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={() => setPasswordDialogOpen(true)} sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}>
                  Set Password
                </Button>
                <Button variant="contained" onClick={() => setEditDialogOpen(true)} sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}>
                  Edit Profile
                </Button>
              </Box>
            </Box>

            <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', letterSpacing: 1 }}>
              Account Information
            </Typography>

            <Box sx={{ mt: 2, border: '1px solid #eee', borderRadius: 2, overflow: 'hidden' }}>
              <Grid container sx={{ borderBottom: '1px solid #eee' }}>
                <Grid size={{ xs: 12, sm: 4 }} sx={{ p: 2, bgcolor: '#fafafa', borderRight: { sm: '1px solid #eee' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Full Name</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }} sx={{ p: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.first_name} {profile.last_name}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container sx={{ borderBottom: '1px solid #eee' }}>
                <Grid size={{ xs: 12, sm: 4 }} sx={{ p: 2, bgcolor: '#fafafa', borderRight: { sm: '1px solid #eee' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Email Address</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }} sx={{ p: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.email}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container>
                <Grid size={{ xs: 12, sm: 4 }} sx={{ p: 2, bgcolor: '#fafafa', borderRight: { sm: '1px solid #eee' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Phone Number</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }} sx={{ p: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {profile.phone_number || '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        ) : null}
      </Box>

      {profile && (
        <EditProfileDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          initialData={{
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
            phone_number: profile.phone_number,
          }}
        />
      )}

      <SetPasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />
      
    </CustomerLayout>
  );
};

export default CustomerProfile;
