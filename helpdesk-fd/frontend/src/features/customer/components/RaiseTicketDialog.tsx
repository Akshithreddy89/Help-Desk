import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Alert, IconButton, Typography, MenuItem } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axiosInstance from '../../../utils/axios';
import { useToast } from '../../../context/ToastContext';

interface RaiseTicketDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const validationSchema = yup.object({
  subject: yup.string().required('Title is required').max(255, 'Title must be at most 255 characters'),
  category: yup.string().required('Category is required').oneOf(['Technical', 'Billing', 'Account', 'General']),
  priority: yup.string().required('Priority is required').oneOf(['Low', 'Medium', 'High']),
  description: yup.string().required('Description is required').min(10, 'Description should be at least 10 characters'),
});

const RaiseTicketDialog: React.FC<RaiseTicketDialogProps> = ({ open, onClose, onSuccess }) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: {
      subject: '',
      category: 'Technical',
      priority: 'Medium',
      description: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setApiError(null);
      try {
        await axiosInstance.post('/tickets', values);
        showToast('Ticket raised successfully', 'success');
        resetForm();
        onSuccess();
        onClose();
      } catch (error: any) {
        console.error("Failed to raise ticket", error);
        setApiError(error.response?.data?.message || 'Failed to raise ticket. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setApiError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Raise a Ticket</Typography>
          <Typography variant="body2" color="text.secondary">Describe your issue and we'll respond soon.</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {apiError && <Alert severity="error">{apiError}</Alert>}
          
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Title</Typography>
            <TextField
              fullWidth
              id="subject"
              name="subject"
              placeholder="Briefly describe the issue"
              variant="outlined"
              size="small"
              value={formik.values.subject}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.subject && Boolean(formik.errors.subject)}
              helperText={formik.touched.subject && formik.errors.subject}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Category</Typography>
              <TextField
                select
                fullWidth
                id="category"
                name="category"
                variant="outlined"
                size="small"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.category && Boolean(formik.errors.category)}
                helperText={formik.touched.category && formik.errors.category}
              >
                {['Technical', 'Billing', 'Account', 'General'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Priority</Typography>
              <TextField
                select
                fullWidth
                id="priority"
                name="priority"
                variant="outlined"
                size="small"
                value={formik.values.priority}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.priority && Boolean(formik.errors.priority)}
                helperText={formik.touched.priority && formik.errors.priority}
              >
                {['Low', 'Medium', 'High'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Description</Typography>
            <TextField
              fullWidth
              id="description"
              name="description"
              placeholder="Provide as much detail as possible..."
              variant="outlined"
              size="small"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0, justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" color="inherit" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={formik.isSubmitting}
            color="primary"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Submit Ticket
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RaiseTicketDialog;
