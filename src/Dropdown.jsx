import React, { useState } from "react";
import { Menu, MenuItem, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddCredits from "./Addcredits";
import Subscription from "./Subscription";
import Password from "./Password";
import PricingTable from "./PricingTable";
import AddSubscription from "./Addsubscription"; // Fixed filename casing
import "./Dropdown.css";

const Dropdown = ({ userId, wabaId, disabled }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(null); // Single state for modals

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleOptionClick = (option) => {
    setOpenModal(option);
    handleMenuClose();
  };

  const handleCloseModal = () => setOpenModal(null);

  return (
    <div className="dropdown">
      <IconButton onClick={handleMenuOpen} disabled={disabled}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOptionClick("AddCredits")}>Add Credits</MenuItem>
        <MenuItem onClick={() => handleOptionClick("Subscription")}>Subscription</MenuItem>
        <MenuItem onClick={() => handleOptionClick("PricingTable")}>Rates</MenuItem>
        <MenuItem onClick={() => handleOptionClick("Password")}>Reset Password</MenuItem>
        <MenuItem onClick={() => handleOptionClick("AddSubscription")}>Add Subscription</MenuItem>
      </Menu>

      {openModal === "AddCredits" && <AddCredits open handleClose={handleCloseModal} userId={userId} wabaId={wabaId} />}
      {openModal === "Subscription" && <Subscription open handleClose={handleCloseModal} userId={userId} wabaId={wabaId} />}
      {openModal === "PricingTable" && <PricingTable open handleClose={handleCloseModal} userId={userId} wabaId={wabaId} />}
      {openModal === "Password" && <Password open handleClose={handleCloseModal} userId={userId} />}
      {openModal === "AddSubscription" && <AddSubscription open handleClose={handleCloseModal} userId={userId} wabaId={wabaId} />}
    </div>
  );
};

export default Dropdown;
