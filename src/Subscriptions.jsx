import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Button,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

const Subscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [priceEdits, setPriceEdits] = useState({});

  useEffect(() => {
    fetch("http://localhost:5001/api/subplans/getAllSubPlans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response:", data);
        if (data.subPlans) {
          setPlans(data.subPlans);
        }
      })
      .catch((error) => console.error("Error fetching plans:", error));
  }, []);

  const toggleEditMode = (planId, price) => {
    setEditMode((prev) => ({ ...prev, [planId]: !prev[planId] }));
    setPriceEdits((prev) => ({ ...prev, [planId]: price }));
  };

  const handleToggle = (planId, permission, currentAllowed) => {
    if (!editMode[planId]) return;
    const newAllowed = !currentAllowed;

    fetch("http://localhost:5001/api/Plans/updatepermission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, permission, allowed: newAllowed }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.updatedPlanPermission) {
          setPlans((prevPlans) =>
            prevPlans.map((plan) =>
              plan.PlanId === planId
                ? {
                    ...plan,
                    permissions: plan.permissions.map((perm) =>
                      perm.permission === permission ? { ...perm, allowed: newAllowed } : perm
                    ),
                  }
                : plan
            )
          );
        }
      })
      .catch((error) => console.error("Error updating permission:", error));
  };

  const handlePriceChange = (planId, newPrice) => {
    setPriceEdits((prev) => ({ ...prev, [planId]: newPrice }));
  };

  const savePrice = (planId) => {
    const newPrice = parseFloat(priceEdits[planId]);
    if (isNaN(newPrice)) return;

    fetch("http://localhost:5001/api/subplans/updatePlanPrice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, newPrice }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.updatedSubPlan) {
          setPlans((prevPlans) =>
            prevPlans.map((plan) =>
              plan.PlanId === planId ? { ...plan, Price: newPrice } : plan
            )
          );
          setEditMode((prev) => ({ ...prev, [planId]: false }));
        }
      })
      .catch((error) => console.error("Error updating price:", error));
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" sx={{ backgroundColor: "#be2ed6", color: "white" }}>
          Create Plan
        </Button>
      </Box>
      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.PlanId}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">{plan.Name}</Typography>
                  <IconButton
                    size="small"
                    sx={{ color: "#808080" }}
                    onClick={() => toggleEditMode(plan.PlanId, plan.Price)}
                  >
                    {editMode[plan.PlanId] ? <SaveIcon /> : <EditIcon />}
                  </IconButton>
                </Box>

                {plan.permissions.map((perm, idx) => (
                  <Box display="flex" alignItems="center" key={idx} sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {perm.permission}
                    </Typography>
                    <Switch
                      checked={perm.allowed}
                      onChange={() => handleToggle(plan.PlanId, perm.permission, perm.allowed)}
                      disabled={!editMode[plan.PlanId]}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#be2ed6" },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#be2ed6",
                        },
                      }}
                    />
                  </Box>
                ))}

                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Pricing</Typography>
                  {editMode[plan.PlanId] ? (
                    <TextField
                      type="number"
                      size="small"
                      value={priceEdits[plan.PlanId]}
                      onChange={(e) => handlePriceChange(plan.PlanId, e.target.value)}
                      sx={{ width: 80 }}
                    />
                  ) : (
                    <Typography>₹{plan.Price.toFixed(2)}</Typography>
                  )}
                </Box>

                {editMode[plan.PlanId] && (
                  <Button
                    variant="contained"
                    sx={{ mt: 2, backgroundColor: "#8E24AA", color: "white" }}
                    onClick={() => savePrice(plan.PlanId)}
                  >
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Subscriptions;
