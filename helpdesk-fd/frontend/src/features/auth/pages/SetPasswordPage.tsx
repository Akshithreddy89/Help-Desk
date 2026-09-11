import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Alert, Link as MuiLink, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AuthLayout from '../components/AuthLayout';
import axiosInstance from '../../../utils/axios';

const validationSchema = yup.object({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirm_password: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const SetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownConfirmPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const formik = useFormik({
    initialValues: {
      password: '',
      confirm_password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      
      if (!token) {
        setError("Invalid or missing invitation token.");
        setSubmitting(false);
        return;
      }

      try {
        const response = await axiosInstance.post('/auth/set-password', {
          token,
          password: values.password,
          confirm_password: values.confirm_password,
        });
        
        if (response.data.success) {
          setSuccess(true);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to set password');
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (success) {
    return (
      <AuthLayout type="login">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2, fontFamily: 'serif' }}>
            Password Set Successfully
          </Typography>
          <Alert severity="success" sx={{ mb: 4, textAlign: 'left' }}>
            Your password has been successfully created. You can now log in to your agent account.
          </Alert>
          <Button
            component={RouterLink}
            to="/login"
            fullWidth
            variant="contained"
            sx={{ py: 1.5, borderRadius: 2 }}
          >
            Go to Login
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout type="login">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ mb: 1, fontFamily: 'serif' }}>
          Create Password
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Set up a password to activate your agent account.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {!token && !error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Missing invitation token. Please use the link provided in your email.
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            New Password
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
            disabled={!token}
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

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Confirm Password
          </Typography>
          <TextField
            fullWidth
            id="confirm_password"
            name="confirm_password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formik.values.confirm_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
            helperText={formik.touched.confirm_password && formik.errors.confirm_password}
            size="small"
            disabled={!token}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={handleMouseDownConfirmPassword}
                      edge="end"
                      disableRipple
                      sx={{ backgroundColor: 'transparent', '&:hover': { backgroundColor: 'transparent' } }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
          disabled={formik.isSubmitting || !token}
          sx={{ py: 1.5, mb: 3, borderRadius: 2 }}
        >
          {formik.isSubmitting ? 'Saving...' : 'Set Password'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <MuiLink component={RouterLink} to="/login" color="text.primary" sx={{ textDecoration: 'none', fontWeight: 'bold' }}>
              Log in
            </MuiLink>
          </Typography>
        </Box>
      </form>
    </AuthLayout>
  );
};

export default SetPasswordPage;
