import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, IconButton, Alert 
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axiosInstance from '../../../utils/axios';

interface AddAgentDialogProps {
  open: boolean;
  onClose: () => void;
  onAgentAdded: () => void;
}

const validationSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone_number: yup.string().required('Phone number is required'),
});

const AddAgentDialog: React.FC<AddAgentDialogProps> = ({ open, onClose, onAgentAdded }) => {
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setError(null);
      try {
        const response = await axiosInstance.post('/admin/agents', values);
        if (response.data.success) {
          resetForm();
          onAgentAdded();
          onClose();
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to create agent');
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
      <DialogTitle sx={{ m: 0, p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Add New Agent</Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the details to onboard a new support agent.
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>First Name</Typography>
              <TextField
                fullWidth
                id="first_name"
                name="first_name"
                placeholder="Alex"
                size="small"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Last Name</Typography>
              <TextField
                fullWidth
                id="last_name"
                name="last_name"
                placeholder="Johnson"
                size="small"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Email Address</Typography>
            <TextField
              fullWidth
              id="email"
              name="email"
              placeholder="agent@helpdesk.io"
              size="small"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Phone Number</Typography>
            <TextField
              fullWidth
              id="phone_number"
              name="phone_number"
              placeholder="+1 (555) 000-0000"
              size="small"
              value={formik.values.phone_number}
              onChange={formik.handleChange}
              error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
              helperText={formik.touched.phone_number && formik.errors.phone_number}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={formik.isSubmitting}
            sx={{ bgcolor: '#111318', '&:hover': { bgcolor: '#2c313d' }, borderRadius: 2, px: 3 }}
          >
            {formik.isSubmitting ? 'Creating...' : 'Create Agent'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddAgentDialog;
