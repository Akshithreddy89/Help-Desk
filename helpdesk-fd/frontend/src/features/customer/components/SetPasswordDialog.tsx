import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Alert, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axiosInstance from '../../../utils/axios';

interface SetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const validationSchema = yup.object({
  old_password: yup.string().required('Current password is required'),
  new_password: yup
    .string()
    .required('New password is required')
    .min(7, 'Password must be more than 6 characters')
    .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirm_password: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('new_password')], 'Passwords must match'),
});

const SetPasswordDialog: React.FC<SetPasswordDialogProps> = ({ open, onClose, onSuccess }) => {
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setError(null);
      try {
        const response = await axiosInstance.post('/customer/change-password', values);
        if (response.data.success) {
          resetForm();
          onSuccess();
          onClose();
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to update password');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Set Password</Typography>
          <Typography variant="body2" color="text.secondary">Enter your current password, then a new one.</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>Old Password</Typography>
            <TextField
              fullWidth
              type="password"
              id="old_password"
              name="old_password"
              value={formik.values.old_password}
              onChange={formik.handleChange}
              error={formik.touched.old_password && Boolean(formik.errors.old_password)}
              helperText={formik.touched.old_password && formik.errors.old_password}
              size="small"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>New Password</Typography>
            <TextField
              fullWidth
              type="password"
              id="new_password"
              name="new_password"
              value={formik.values.new_password}
              onChange={formik.handleChange}
              error={formik.touched.new_password && Boolean(formik.errors.new_password)}
              helperText={formik.touched.new_password && formik.errors.new_password}
              size="small"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>Confirm New Password</Typography>
            <TextField
              fullWidth
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formik.values.confirm_password}
              onChange={formik.handleChange}
              error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
              helperText={formik.touched.confirm_password && formik.errors.confirm_password}
              size="small"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 'bold', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
          >
            {formik.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SetPasswordDialog;
