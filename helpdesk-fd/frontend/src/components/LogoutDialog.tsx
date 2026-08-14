import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

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
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            p: 1,
            minWidth: 320,
          }
        }
      }}
    >
      <DialogTitle id="logout-dialog-title" sx={{ fontWeight: 'bold' }}>
        Confirm Logout
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="logout-dialog-description">
          Are you sure you want to logout?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" size="small">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" size="small" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;
