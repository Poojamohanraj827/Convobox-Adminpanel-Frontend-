import React, { useState, useEffect } from "react";
import "./Font.css";
import { TextField, Button, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal } from "@mui/material";
import axios from "axios";

const Subscription = ({ open, handleClose, userId, wabaId }) => {
  const ADMIN_SERVER_URL = process.env.REACT_APP_ADMIN_SERVER_URL;
  const [planData, setPlanData] = useState(null);
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (open) {
      fetchPlanDetails();
    }
  }, [open]);

  const fetchPlanDetails = async () => {
    try {
      const response = await axios.post(`${ADMIN_SERVER_URL}/api/planuser/getplanuser`, { UserId: userId, WabaId: wabaId });
      setPlanData(response.data);
      setPrice(response.data.price); // Ensure lowercase if the API returns it this way
    } catch (error) {
      console.error("Error fetching plan details:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.post(`${ADMIN_SERVER_URL}/api/planuser/updateplanuser`, {
        UserId: userId,
        WabaId: wabaId,
        PlanId: planData.PlanId,
        Price: price, // Only send the price to the backend
      });
      handleClose();
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    p: 4,
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6">Subscription Details</Typography>
        {planData && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Plan Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Exp Value</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                </TableRow>
              </TableHead>
              {planData ? (
                <TableBody>
                  <TableRow>
                    <TableCell>{planData.planName}</TableCell>
                    <TableCell>{planData.expValue}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        variant="outlined"
                        size="small"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <Typography>Loading...</Typography>
              )}
            </Table>
          </TableContainer>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button variant="contained" color="primary" onClick={handleUpdate}>
            Update
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default Subscription;