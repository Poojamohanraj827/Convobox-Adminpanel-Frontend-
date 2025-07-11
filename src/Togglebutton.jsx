import { useState, useEffect } from "react";
import { Switch } from "@mui/material";
import axios from "axios";
import "./Togglebutton.css";

const ToggleButton = ({ userId, wabaId, onUpdate }) => {
    const ADMIN_SERVER_URL = process.env.REACT_APP_ADMIN_SERVER_URL;
    const [isActive, setIsActive] = useState(false); // Default state until fetched
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccountStatus = async () => {
            try {
                const response = await axios.post(`${ADMIN_SERVER_URL}/api/accounts/getAccountStatus`, {
                    userId,
                    wabaId,
                });
                setIsActive(response.data.accStatus === "ACTIVE"); // Set isActive based on accStatus
            } catch (error) {
                console.error("Error fetching account status:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAccountStatus();
    }, [userId, wabaId]);

    const handleToggle = async () => {
        const newStatus = !isActive; // Toggle the status

        try {
            // Call the backend function to toggle account status
            await axios.post(`${ADMIN_SERVER_URL}/api/accounts/toggleAccountStatus`, {
                userId,
                wabaId,
                deactivate: !newStatus, // true for deactivation, false for activation
            });

            setIsActive(newStatus); // Update the local state
            onUpdate(userId, wabaId, newStatus ? "ACTIVE" : "DEACTIVATED"); // Notify parent component
        } catch (error) {
            console.error("Error updating account status:", error);
        }
    };

    if (loading) return <p>Loading...</p>; // Show a loading state while fetching

    return (
        <div className={`toggle-button ${isActive ? "active" : ""}`} onClick={handleToggle}>
            <Switch
                checked={isActive}
                onChange={handleToggle}
                color="primary"
                sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#FFFFFF", // Active color (Green)
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#800080", // Active background (Green)
                    },
                    "& .MuiSwitch-switchBase": {
                        color: "#FFFFFF", // Inactive color (Red)
                    },
                    "& .MuiSwitch-switchBase + .MuiSwitch-track": {
                        backgroundColor: "#808080", // Default track color
                    },
                }}
            />
            <div className="toggle-circle"></div>
        </div>
    );
};

export default ToggleButton;