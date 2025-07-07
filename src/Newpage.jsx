import React, { useState } from 'react';
import "./Font.css";
import { 
  TextField, 
  Button, 
  Typography, 
  Grid, 
  Modal, 
  Box, 
  IconButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Newpage = ({ open, handleClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessWebsite: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...formData,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form on successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        businessWebsite: '',
        password: ''
      });
      setErrors({});
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    p: 4,
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  };

  return (
    <Modal open={open} onClose={!loading ? handleClose : undefined}>
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={!loading ? handleClose : undefined}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h4" align="center" gutterBottom>
          Create New Account
        </Typography>
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <label htmlFor="name">Name*</label>
              <TextField
                name="name"
                variant="outlined"
                fullWidth
                placeholder="Enter your name here"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <label htmlFor="email">Email*</label>
              <TextField
                name="email"
                variant="outlined"
                fullWidth
                type="email"
                placeholder="example@convobox.com"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <label htmlFor="phone">Phone number*</label>
              <TextField
                name="phone"
                variant="outlined"
                fullWidth
                placeholder="+91 9994770276"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <label htmlFor="businessName">Business name*</label>
              <TextField
                name="businessName"
                variant="outlined"
                fullWidth
                placeholder="Enter business name"
                value={formData.businessName}
                onChange={handleChange}
                error={!!errors.businessName}
                helperText={errors.businessName}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <label htmlFor="businessWebsite">Business Website</label>
              <TextField
                name="businessWebsite"
                variant="outlined"
                fullWidth
                placeholder="Enter business website"
                value={formData.businessWebsite}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <label htmlFor="password">Password*</label>
              <TextField
                name="password"
                variant="outlined"
                fullWidth
                type="password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                style={{ backgroundColor: '#8e24aa' }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
};

export default Newpage;