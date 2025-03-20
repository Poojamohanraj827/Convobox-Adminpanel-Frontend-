import React, { useState } from 'react';
import "./Font.css";
import { TextField, Button, Typography, Grid, Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const Newpage = ({ open, handleClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessWebsite: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post('http://localhost:5000/api/accounts/createUser', formData);
      console.log("User created:", response.data);
      handleClose(); // Close the modal after successful creation
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
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
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
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
                required
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
                required
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
                required
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
                required
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
                required
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
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </Grid>
          </Grid>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </form>
      </Box>
    </Modal>
  );
};

export default Newpage;