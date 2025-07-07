

import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Modal,
  Box,
  IconButton,
  CircularProgress,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import dayjs from "dayjs";

const AddSubscription = ({ open, handleClose, userId, wabaId }) => {
  const [plan, setPlan] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD")); // Default to today
  const [endDate, setEndDate] = useState(""); // State for calculated end date
  const [plans, setPlans] = useState([]); // Store plans from backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch subscription plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.post("http://localhost:5001/api/subPlans/getAllPlanNames");
        setPlans(response.data);
      } catch (err) {
        setError("Failed to load plans.");
      }
    };

    fetchPlans();
  }, []);

  // Calculate end date whenever subscriptionType or startDate changes
  useEffect(() => {
    if (subscriptionType && startDate) {
      const start = dayjs(startDate);
      let end;

      switch (subscriptionType) {
        case "MONTH":
          end = start.add(1, "month");
          break;
        case "QUARTERLY":
          end = start.add(3, "months");
          break;
        case "YEARLY":
          end = start.add(1, "year");
          break;
        default:
          end = start;
      }

      // Format end date as "day-month-year"
      setEndDate(end.format("DD-MM-YYYY"));
    } else {
      setEndDate("");
    }
  }, [subscriptionType, startDate]);

  // Handle subscription activation
  const handleUpdate = async () => {
    if (!plan || !subscriptionType || !startDate) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    const requestData = {
      userId,
      wabaId,
      planName: plan,
      expValue: subscriptionType,
      startDate,
      planStatus: true,
    };

    try {
      const response = await axios.post(
        "http://localhost:5001/api/planuser/createplanuser",
        requestData
      );
      console.log("Subscription Activated:", response.data);
      handleClose(); // Close modal after success
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500, // Fixed width for the modal
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
        }}
      >
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" gutterBottom>
          Activate Subscription
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={2}>
          {/* Plan Selection (Fetched from API) */}
          <Grid item xs={12}>
            <TextField
              label="Subscription Plan"
              variant="outlined"
              select
              SelectProps={{ native: true }}
              fullWidth
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true, // Ensure the label is always displayed above the select field
              }}
            >
              <option value="">Select a Subscription Plan</option>
              {plans.map((p) => (
                <option key={p.PlanId} value={p.Name}>
                  {p.Name}
                </option>
              ))}
            </TextField>
          </Grid>

          {/* Subscription Type Selection */}
          <Grid item xs={12}>
            <TextField
              label="Subscription Duration"
              variant="outlined"
              select
              SelectProps={{ native: true }}
              fullWidth
              value={subscriptionType}
              onChange={(e) => setSubscriptionType(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true, // Ensure the label is always displayed above the select field
              }}
            >
              <option value="">Select Duration</option>
              <option value="MONTH">Month</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="YEARLY">Yearly</option>
            </TextField>
          </Grid>

          {/* Start Date Input */}
          <Grid item xs={12}>
            <TextField
              label="Start Date"
              type="date"
              variant="outlined"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true, // Ensure the label is always displayed above the input field
              }}
            />
          </Grid>

          {/* End Date Display (Read-only) */}
          <Grid item xs={12}>
            <TextField
              label="End Date"
              variant="outlined"
              fullWidth
              value={endDate}
              sx={{ mb: 2 }}
              InputProps={{
                readOnly: true,
              }}
              InputLabelProps={{
                shrink: true, // Ensure the label is always displayed above the input field
              }}
            />
          </Grid>

          {/* Activate Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Activate"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default AddSubscription;