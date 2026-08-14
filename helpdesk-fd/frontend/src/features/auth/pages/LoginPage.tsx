import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Link as MuiLink, Alert, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AuthLayout from '../components/AuthLayout';
import axiosInstance from '../../../utils/axios';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        const response = await axiosInstance.post('/auth/login', values);
        
        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          sessionStorage.setItem('toastMessage', 'Logged in successfully');
          // Redirect to the dashboard provided by backend
          navigate(response.data.dashboard);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to login');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <AuthLayout type="login">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 1, fontFamily: 'serif' }}>
          Welcome back.
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Sign in to access your support dashboard.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ mb: 3 }}>
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

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Password
          </Typography>
          <TextField
            fullWidth
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      disableRipple
                      sx={{ backgroundColor: 'transparent', '&:hover': { backgroundColor: 'transparent' } }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
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
          {formik.isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <MuiLink component={RouterLink} to="/register" color="text.primary" sx={{ textDecoration: 'none', fontWeight: 'bold' }}>
              Register here
            </MuiLink>
          </Typography>
        </Box>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
