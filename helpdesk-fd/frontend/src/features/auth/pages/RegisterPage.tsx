import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Link as MuiLink, Alert, Grid } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AuthLayout from '../components/AuthLayout';
import axiosInstance from '../../../utils/axios';

const validationSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  phone_number: yup.string().required('Phone number is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(7, 'Password must be more than 6 characters')
    .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      email: '',
      password: '',
      confirm_password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        const response = await axiosInstance.post('/auth/register', {
          first_name: values.first_name,
          last_name: values.last_name,
          phone_number: values.phone_number,
          email: values.email,
          password: values.password,
        });

        if (response.data.success) {
          // Registration successful, redirect to login
          navigate('/login');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to register');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <AuthLayout type="register">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 1, fontFamily: 'serif' }}>
          Create account.
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Join your team on HelpDesk today.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                First name
              </Typography>
              <TextField
                fullWidth
                id="first_name"
                name="first_name"
                placeholder="Jane"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
                size="small"
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Last name
              </Typography>
              <TextField
                fullWidth
                id="last_name"
                name="last_name"
                placeholder="Smith"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
                size="small"
              />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Phone number
          </Typography>
          <TextField
            fullWidth
            id="phone_number"
            name="phone_number"
            placeholder="+1234567890"
            value={formik.values.phone_number}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
            helperText={formik.touched.phone_number && formik.errors.phone_number}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Email address
          </Typography>
          <TextField
            fullWidth
            id="email"
            name="email"
            placeholder="jane@company.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Password
          </Typography>
          <TextField
            fullWidth
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Confirm password
          </Typography>
          <TextField
            fullWidth
            id="confirm_password"
            name="confirm_password"
            type="password"
            placeholder="••••••••"
            value={formik.values.confirm_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
            helperText={formik.touched.confirm_password && formik.errors.confirm_password}
            size="small"
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={formik.isSubmitting}
          sx={{ py: 1.5, mb: 3, borderRadius: 2 }}
        >
          {formik.isSubmitting ? 'Registering...' : 'Register'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <MuiLink component={RouterLink} to="/login" color="text.primary" sx={{ textDecoration: 'none', fontWeight: 'bold' }}>
              Login
            </MuiLink>
          </Typography>
        </Box>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
