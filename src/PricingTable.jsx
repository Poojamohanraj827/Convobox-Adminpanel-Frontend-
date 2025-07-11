import React, { useEffect, useState } from "react";
import "./Font.css";
import { Grid, Typography, TextField, Button, Paper, Modal, Box } from "@mui/material";
import axios from "axios";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  p: 4,
};

const PricingTable = ({ open, handleClose, userId, wabaId }) => {
  const ADMIN_SERVER_URL = process.env.REACT_APP_ADMIN_SERVER_URL;
  const [charges, setCharges] = useState([]);
  const [updatedCharges, setUpdatedCharges] = useState([]);

  useEffect(() => {
    if (open && userId && wabaId) {
      fetchUserCharges();
    }
  }, [open, userId, wabaId]);

  const fetchUserCharges = async () => {
    try {
      const response = await axios.post(`${ADMIN_SERVER_URL}/api/charges/getUserCharges`, { userId, wabaId });
      setCharges(response.data);

      // Initialize updatedCharges with existing values
      const initialCharges = response.data.map((charge) => ({
        name: charge.name,
        markupPrice: charge.markupPrice.toString(), // Store as string for controlled input
      }));

      setUpdatedCharges(initialCharges);
    } catch (error) {
      console.error("Error fetching user charges:", error);
    }
  };

  const handleMarkupChange = (name, value) => {
    if (/^\d*\.?\d*$/.test(value)) { // Allow only valid float numbers
      setUpdatedCharges((prevCharges) =>
        prevCharges.map((charge) =>
          charge.name === name ? { ...charge, markupPrice: value } : charge
        )
      );
    }
  };

  const handleUpdate = async () => {
    try {
      const formattedCharges = updatedCharges.map((charge) => ({
        ...charge,
        markupPrice: parseFloat(charge.markupPrice) || 0, // Convert to float before sending
      }));

      await axios.post(`${ADMIN_SERVER_URL}/api/charges/updateCharges1`, {
        userId,
        wabaId,
        updatedCharges: formattedCharges,
      });

      handleClose();
    } catch (error) {
      console.error("Error updating user charges:", error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper elevation={3} sx={style}>
        <Typography variant="h6" gutterBottom>
          Rates
        </Typography>

        <Box sx={{ backgroundColor: "#f5f2ff", padding: 2, borderRadius: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4}>
              <Typography variant="subtitle1">Charge Name</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle1" align="center">Default Pricing</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="subtitle1" align="center">Markup Pricing</Typography>
            </Grid>
          </Grid>
        </Box>

        {charges.map((charge) => (
          <Grid container spacing={2} alignItems="center" key={charge.name} sx={{ mt: 2 }}>
            <Grid item xs={4}>
              <Typography>{charge.name}</Typography>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth value={charge.defaultPrice} variant="outlined" size="small" disabled />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                value={updatedCharges.find((c) => c.name === charge.name)?.markupPrice || ""}
                onChange={(e) => handleMarkupChange(charge.name, e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        ))}

        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={6}>
            <Button fullWidth variant="outlined" color="secondary" onClick={fetchUserCharges}>
              Reset Rates
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant="contained" color="primary" onClick={handleUpdate}>
              Update
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  );
};

export default PricingTable;
