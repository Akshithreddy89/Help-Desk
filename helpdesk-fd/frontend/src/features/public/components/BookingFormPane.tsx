import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import dayjs from 'dayjs';
import { MuiTelInput } from 'mui-tel-input';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface BookingFormPaneProps {
  heldUntil: string;
  onTimeout: () => void;
  onSubmit: (data: { name: string; email: string; phone: string; notes: string }) => Promise<void>;
  isSubmitting?: boolean;
}

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
});

const BookingFormPane: React.FC<BookingFormPaneProps> = ({ heldUntil, onTimeout, onSubmit, isSubmitting }) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
    validationSchema: validationSchema,
    onSubmit: () => {
      setIsConfirmDialogOpen(true);
    },
  });

  useEffect(() => {
    const updateTimer = () => {
      const diff = dayjs(heldUntil).diff(dayjs(), 'second');
      if (diff <= 0) {
        setTimeLeft('00:00');
        onTimeout();
      } else {
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [heldUntil, onTimeout]);

  const handleConfirm = () => {
    setIsConfirmDialogOpen(false);
    onSubmit(formik.values);
  };

  return (
    <Box sx={{ p: 3, px: 4, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Enter Details
        </Typography>
        <Typography 
          variant="body2" 
          color="error" 
          sx={{ fontWeight: 'bold', bgcolor: 'error.light', color: 'error.main', px: 1.5, py: 0.5, borderRadius: 1 }}
        >
          {timeLeft}
        </Typography>
      </Box>

      <Box component="form" onSubmit={formik.handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Name *</Typography>
          <TextField 
            fullWidth 
            id="name"
            name="name"
            required 
            size="small"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Email *</Typography>
          <TextField 
            fullWidth 
            id="email"
            name="email"
            required 
            type="email"
            size="small"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Phone *</Typography>
          <MuiTelInput
            fullWidth
            id="phone"
            name="phone"
            required
            value={formik.values.phone}
            onChange={(value) => formik.setFieldValue('phone', value)}
            onBlur={() => formik.setFieldTouched('phone', true)}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
            size="small"
            defaultCountry="US"
          />
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Please share anything that will help prepare for our meeting.</Typography>
          <TextField 
            fullWidth 
            id="notes"
            name="notes"
            multiline
            rows={1}
            value={formik.values.notes}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          By proceeding, you confirm that you have read and agree to our Participant Terms and Privacy Notice.
        </Typography>

        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={formik.isSubmitting || isSubmitting}
          sx={{ alignSelf: 'flex-start', mt: 1, borderRadius: 6, px: 4, py: 1, fontWeight: 'bold', textTransform: 'none' }}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Schedule Event'}
        </Button>
      </Box>

      <Dialog open={isConfirmDialogOpen} onClose={() => setIsConfirmDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Confirm Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to schedule this event?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setIsConfirmDialogOpen(false)} color="inherit" sx={{ fontWeight: 'bold' }}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="contained" color="primary" sx={{ fontWeight: 'bold' }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingFormPane;
