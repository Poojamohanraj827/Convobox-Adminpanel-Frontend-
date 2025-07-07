import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    Box,
    CircularProgress
} from "@mui/material";
import "./Font.css";
import axios from "axios";

const Rates = () => {
    const [pricing, setPricing] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Fetch default rates from backend
    const fetchRates = async () => {
        try {
            setLoading(true);
            const response = await axios.post("http://localhost:5001/api/defaultcharges/getdefaultcharges");

            if (response.status === 200 && response.data.charges) {
                const rates = {};
                response.data.charges.forEach((charge) => {
                    rates[charge.name] = {
                        id: charge.id,
                        code: charge.code,
                        default: charge.defaultPrice.toString(),
                        markup: charge.markupPrice.toString(),
                    };
                });

                setPricing(rates);
            }
        } catch (error) {
            console.error("Error fetching rates:", error);
            alert("Failed to fetch rates.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    // Update rates in the backend
    const updateRates = async () => {
        try {
            setUpdating(true);

            const updatedCharges = Object.entries(pricing).map(([name, value]) => ({
                id: value.id,
                code: value.code,
                name,
                defaultPrice: parseFloat(value.default), // Default remains unchanged
                markupPrice: parseFloat(value.markup),  // Updated markup price
            }));

            console.log("Updating charges:", updatedCharges);

            // Send updated charges one by one to the backend
            for (const charge of updatedCharges) {
                await axios.post(
                    "http://localhost:5001/api/defaultcharges/updatedefaultcharges",
                    charge,
                    { headers: { "Content-Type": "application/json" } }
                );
            }

            alert("Rates updated successfully!");
            fetchRates(); // Refresh the updated values
        } catch (error) {
            console.error("Error updating rates:", error.response?.data || error.message);
            alert("Failed to update rates.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;
    }

    return (
        <div id="pass">
            <Box className="Rate" sx={{ p: 8 }}>
                <Paper sx={{ p: 2, maxWidth: "800px", mx: "auto" }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Charge Name</TableCell>
                                    <TableCell>Default Pricing</TableCell>
                                    <TableCell>Markup Pricing</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(pricing).map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell sx={{ textTransform: "capitalize" }}>{key}</TableCell>
                                        <TableCell>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={value.default}
                                                InputProps={{ readOnly: true }} // Make Default Pricing read-only
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={value.markup}
                                                onChange={(e) =>
                                                    setPricing((prev) => ({
                                                        ...prev,
                                                        [key]: { ...value, markup: e.target.value },
                                                    }))
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                        <Button variant="contained" color="primary" onClick={updateRates} disabled={updating}>
                            {updating ? "Updating..." : "Update Rates"}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </div>
    );
};

export default Rates;
