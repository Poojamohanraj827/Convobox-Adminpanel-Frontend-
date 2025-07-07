import React, { useState } from "react";
import { TextField, Button, Box, Typography, Modal } from "@mui/material";
import axios from "axios";
import "./Font.css";

const AddCredits = ({ open, handleClose, userId, wabaId, onCreditsUpdated }) => {
  const [amount, setAmount] = useState("");
  const [notes, setnotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5001/api/admin/addCredits", {
        userId,
        wabaId,
        amount: Number(amount), // Ensure it's a number
        notes,
      });

      console.log("Credits Updated:", response.data);

      // Notify parent component (Dashboard) about the update
      if (onCreditsUpdated) {
        onCreditsUpdated(response.data);
      }

      // Reset fields & close modal
      setAmount("");
      setnotes("");
      handleClose();
    } catch (err) {
      console.error("Error updating credits:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to update credits.");
    } finally {
      setLoading(false);
    }
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    p: 4,
    borderRadius: 2,
    boxShadow: 24,
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom>
          Add Credits
        </Typography>
        {error && (
          <Typography variant="body2" color="error" gutterBottom>
            {error}
          </Typography>
        )}
        <TextField
          label="Amount"
          variant="outlined"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Reason/Comments"
          variant="outlined"
          value={notes}
          onChange={(e) => setnotes(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
        </Button>
      </Box>
    </Modal>
  );
};

export default AddCredits;
