import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutDialog: React.FC<LogoutDialogProps> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: 1,
            boxShadow: '0px 20px 40px rgba(0,0,0,0.15)',
          }
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1, pr: 1 }}>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary', transition: 'transform 0.2s', '&:hover': { transform: 'rotate(90deg)' } }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pt: 1, pb: 4, px: { xs: 3, sm: 6 } }}>
        <Box 
          sx={{ 
            width: 88, 
            height: 88, 
            borderRadius: '50%', 
            backgroundColor: 'error.main', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 3,
            color: 'white',
            boxShadow: '0 8px 24px rgba(211, 47, 47, 0.4)'
          }}
        >
          <LogoutIcon sx={{ fontSize: 44, ml: 0.5 }} />
        </Box>
        <Typography id="logout-dialog-title" variant="h4" component="h2" gutterBottom color="text.primary" sx={{ fontWeight: '800' }}>
          Ready to leave?
        </Typography>
        <DialogContentText id="logout-dialog-description" variant="body1" sx={{ color: 'text.secondary', mb: 1, fontSize: '1.1rem' }}>
          You are about to be securely logged out of your account.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 3, sm: 6 }, pb: 5, justifyContent: 'center', gap: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="inherit" 
          size="large"
          sx={{ 
            minWidth: 150, 
            borderRadius: 3, 
            textTransform: 'none', 
            fontWeight: 600,
            fontSize: '1.05rem',
            py: 1.2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
              bgcolor: 'action.hover'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error" 
          size="large" 
          autoFocus
          sx={{ 
            minWidth: 150, 
            borderRadius: 3, 
            textTransform: 'none', 
            fontWeight: 600,
            fontSize: '1.05rem',
            py: 1.2,
            boxShadow: '0 6px 16px rgba(211, 47, 47, 0.3)',
            '&:hover': {
              boxShadow: '0 8px 20px rgba(211, 47, 47, 0.5)',
            }
          }}
        >
          Yes, Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;
