import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Alert, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axiosInstance from '../../../utils/axios';

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
}

const validationSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone_number: yup.string().required('Phone number is required'),
});

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ open, onClose, onSuccess, initialData }) => {
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: initialData,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        const response = await axiosInstance.put('/customer/profile', values);
        if (response.data.success) {
          onSuccess();
          onClose();
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to update profile');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Edit Profile</Typography>
          <Typography variant="body2" color="text.secondary">Update your personal details.</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
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

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>First Name</Typography>
              <TextField
                fullWidth
                id="first_name"
                name="first_name"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
                size="small"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>Last Name</Typography>
              <TextField
                fullWidth
                id="last_name"
                name="last_name"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
                size="small"
              />
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>Email</Typography>
            <TextField
              fullWidth
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              size="small"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>Phone</Typography>
            <TextField
              fullWidth
              id="phone_number"
              name="phone_number"
              value={formik.values.phone_number}
              onChange={formik.handleChange}
              error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
              helperText={formik.touched.phone_number && formik.errors.phone_number}
              size="small"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" sx={{ fontWeight: 'bold', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
          >
            {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProfileDialog;
