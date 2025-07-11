    import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Checkbox,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SyncIcon from '@mui/icons-material/Sync'; // Import Sync icon
import ToggleButton from "./Togglebutton";
import Dropdown from "./Dropdown";
import Newpage from "./Newpage";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar1 = () => {
    const ADMIN_SERVER_URL = process.env.REACT_APP_ADMIN_SERVER_URL;
    const navigate = useNavigate();
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [tableData, setTableData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState({ userId: null, wabaId: null });
    const [selectedRestoreUser, setSelectedRestoreUser] = useState({ userId: null, wabaId: null });
    const [newPageOpen, setNewPageOpen] = useState(false);
    const [syncing, setSyncing] = useState(false); // State for sync operation
    const [snackbar, setSnackbar] = useState({ // State for snackbar notifications
        open: false,
        message: '',
        severity: 'success'
    });
        const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
        // Function to format date as day-month-year
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0'); // Ensure 2 digits for day
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };
        // Function to handle sync accounts
    const handleSyncAccounts = async () => {
        setSyncing(true);
        try {
            const response = await axios.post(`${ADMIN_SERVER_URL}/api/accounts/syncAccounts`);
            setSnackbar({
                open: true,
                message: response.data.message || 'Accounts synced successfully',
                severity: 'success'
            });
            // Refresh the accounts after sync
            fetchAllAccounts();
        } catch (error) {
            console.error("Error syncing accounts:", error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to sync accounts',
                severity: 'error'
            });
        } finally {
            setSyncing(false);
        }
    };
        // Modify the checkbox handler to track selected accounts
    const handleCheckboxChange = (event, userId, wabaId) => {
        if (event.target.checked) {
            setSelectedAccounts(prev => [...prev, { userId, wabaId }]);
            setCount(prev => prev + 1);
        } else {
            setSelectedAccounts(prev => prev.filter(account => 
                !(account.userId === userId && account.wabaId === wabaId)
            ));
            setCount(prev => prev - 1);
        }
    };

    // Open bulk delete confirmation dialog
    const handleBulkDeleteClick = () => {
        if (selectedAccounts.length === 0) {
            setSnackbar({
                open: true,
                message: 'Please select at least one account to delete',
                severity: 'warning'
            });
            return;
        }
        setBulkDeleteDialogOpen(true);
    };

    // Handle bulk delete confirmation
    const handleBulkDeleteConfirm = async () => {
        try {
            const response = await axios.post(`${ADMIN_SERVER_URL}/api/accounts/bulkDeleteAccounts`, {
                accounts: selectedAccounts
            });

            setSnackbar({
                open: true,
                message: response.data.message || `Successfully deleted ${response.data.deletedCount} account(s)`,
                severity: 'success'
            });

            // Refresh the table data
            fetchAllAccounts();
            
            // Reset selections
            setSelectedAccounts([]);
            setCount(0);
            
            // Close the dialog
            setBulkDeleteDialogOpen(false);
            
            // Show any errors that occurred during bulk deletion
            if (response.data.errors && response.data.errors.length > 0) {
                setSnackbar({
                    open: true,
                    message: `${response.data.errors.length} accounts failed to delete`,
                    severity: 'error'
                });
            }
        } catch (error) {
            console.error("Error in bulk delete:", error);
            setSnackbar({
                open: true,
                message: error.response?.data?.error || 'Failed to delete accounts',
                severity: 'error'
            });
            setBulkDeleteDialogOpen(false);
        }
    };

        // Fetch all accounts on initial load
        useEffect(() => {
            fetchAllAccounts();
        }, []);

        // Function to fetch all accounts
        const fetchAllAccounts = async () => {
            setLoading(true);
            try {
                const response = await axios.post(`${ADMIN_SERVER_URL}/api/accounts/getAllAccounts`);
                const mappedData = response.data.map((account, index) => ({
                    id: index + 1,
                    userId: account.userId,
                    wabaId: account.wabaId,
                    business: account.businessName,
                    email: account.userEmail,
                    contact: account.userPhone,
                    date: formatDate(account.userCreatedDate), // Format date
                    wabaStatus: account.userPhoneStatus,
                    subscription: account.planName,
                        // Set to null if plan is "No Plan"
                        startDate: account.planName === "No Plan" ? null : formatDate(account.PlanEff),
                        endDate: account.planName === "No Plan" ? null : formatDate(account.PlanExp),
                        accStatus: account.accStatus,
                        balance: null,
                        // Add PlanStatus for the ToggleButton
                        PlanStatus: account.PlanStatus || "Inactive"
                                    }));

                // Fetch balances in parallel
                const balances = await Promise.all(mappedData.map(account => fetchBalance(account.userId, account.wabaId)));
                const updatedData = mappedData.map((account, index) => ({ ...account, balance: balances[index] }));
                setTableData(updatedData);
            } catch (error) {
                console.error("Error fetching accounts:", error);
                setError("Failed to fetch accounts.");
            } finally {
                setLoading(false);
            }
        };

        // Function to fetch balance for an account
        const fetchBalance = async (userId, wabaId) => {
            try {
                const response = await axios.post(`${ADMIN_SERVER_URL}/api/credit/getBalance`, { userId, wabaId });
                return response.data.balance || 0;
            } catch (error) {
                console.error(`Error fetching balance for ${userId}:`, error);
                return 0;
            }
        };

        // Function to search accounts by business name
        const searchAccounts = async (businessName) => {
            if (!businessName) {
                fetchAllAccounts(); // If search term is empty, fetch all accounts
                return;
            }

            setLoading(true);
            try {
                const response = await axios.post(`${ADMIN_SERVER_URL}/api/admin/searchrecords`, { businessName });
                const mappedData = response.data.accounts.map((account, index) => ({
                    id: index + 1,
                    userId: account.userId,
                    wabaId: account.wabaId,
                    business: account.businessName,
                    email: account.userEmail,
                    contact: account.userPhone,
                    date: formatDate(account.userCreatedDate), // Format date
                    wabaStatus: account.userPhoneStatus,
                    subscription: account.planName,
                    startDate: formatDate(account.PlanEff), // Format startDate
                    endDate: formatDate(account.PlanExp), // Format endDate
                    accStatus: account.accStatus,
                    balance: null
                }));

                // Fetch balances in parallel
                const balances = await Promise.all(mappedData.map(account => fetchBalance(account.userId, account.wabaId)));
                const updatedData = mappedData.map((account, index) => ({ ...account, balance: balances[index] }));
                setTableData(updatedData);
            } catch (error) {
                console.error("Error searching accounts:", error);
                setError("Failed to search accounts.");
            } finally {
                setLoading(false);
            }
        };

        // Handle search input change
        const handleSearchChange = (e) => {
            const term = e.target.value;
            setSearchTerm(term);
            searchAccounts(term); // Trigger search when the user types
        };

        // Pagination handlers
        const handleChangePage = (event, newPage) => setPage(newPage);

        const handleChangeRowsPerPage = (event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
        };

        // Checkbox handler
        // const handleCheckboxChange = (event) => {
        //     setCount(prev => event.target.checked ? prev + 1 : prev - 1);
        // };

        // Open delete confirmation dialog
        const handleDeleteClick = (userId, wabaId) => {
            setSelectedUser({ userId, wabaId }); // Store the selected user
            setDeleteDialogOpen(true); // Open the confirmation dialog
        };

        // Close delete confirmation dialog
        const handleDeleteDialogClose = () => {
            setDeleteDialogOpen(false); // Close the dialog
            setSelectedUser({ userId: null, wabaId: null }); // Reset selected user
        };

        // Handle delete confirmation
        const handleDeleteConfirm = () => {
            const { userId, wabaId } = selectedUser;
            axios.post(`${ADMIN_SERVER_URL}/api/accounts/deleteaccount`, { userId, wabaId })
                .then(() => {
                    setTableData(prevData => prevData.map(item => 
                        item.userId === userId ? { ...item, accStatus: 'DELETED' } : item
                    ));
                    handleDeleteDialogClose(); // Close the dialog after deletion
                })
                .catch(error => console.error("Error deleting account:", error));
        };

        // Open restore confirmation dialog
        const handleRestoreClick = (userId, wabaId) => {
            setSelectedRestoreUser({ userId, wabaId }); // Store the selected user
            setRestoreDialogOpen(true); // Open the confirmation dialog
        };

        // Close restore confirmation dialog
        const handleRestoreDialogClose = () => {
            setRestoreDialogOpen(false); // Close the dialog
            setSelectedRestoreUser({ userId: null, wabaId: null }); // Reset selected user
        };

        // Handle restore confirmation
        const handleRestoreConfirm = () => {
            const { userId, wabaId } = selectedRestoreUser;
            axios.post(`${ADMIN_SERVER_URL}/api/accounts/restoreaccount`, { userId, wabaId })
                .then(() => {
                    setTableData(prevData => prevData.map(item => 
                        item.userId === userId ? { ...item, accStatus: 'ACTIVE' } : item
                    ));
                    handleRestoreDialogClose(); // Close the dialog after restoration
                })
                .catch(error => console.error("Error restoring account:", error));
        };

        // Open Newpage modal
        const handleNewPageOpen = () => {
            setNewPageOpen(true);
        };

        // Close Newpage modal
        const handleNewPageClose = () => {
            setNewPageOpen(false);
        };
            const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };
        // Function to handle account creation
    const handleCreateAccount = async (formData) => {
        try {
            const response = await axios.post(`${ADMIN_SERVER_URL}/api/accounts/createaccounts`, formData);
            setSnackbar({
                open: true,
                message: 'Account created successfully!',
                severity: 'success'
            });
            fetchAllAccounts(); // Refresh the account list
            handleNewPageClose(); // Close the modal
        } catch (error) {
            console.error("Error creating account:", error);
            setSnackbar({
                open: true,
                message: error.response?.data?.error || 'Failed to create account',
                severity: 'error'
            });
        }
    };

        // Calculate visible rows for pagination
        const visibleRows = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ paddingLeft: 7,fontFamily:"DM Sans", }}>
            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Card variant="outlined" sx={{ mb: 3, width: '100%', borderWidth: '1px' }}>
                <CardContent>
                    <Typography sx={{fontFamily:"DM Sans",fontWeight:700,fontSize:"25px"}}>Customers</Typography>
                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mb: 3, borderRadius:"12px"}}>
                <TextField
                sx={{boxRadius:"20px",}}
                    size="small"
                    placeholder="Search"
                    InputProps={{ endAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} /> }}
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <Button
                    variant="contained"
                    startIcon={<SyncIcon />}
                    onClick={handleSyncAccounts}
                    disabled={syncing}
                    sx={{ backgroundColor: 'primary.main' }}
                >
                    {syncing ? 'Syncing...' : 'Sync Accounts'}
                </Button>
                <Button
                    sx={{ backgroundColor: 'rgb(194, 39, 214)' }}
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNewPageOpen}
                >
                    New Customers
                </Button>
            </Box>

                {loading && <Typography>Loading...</Typography>}
                {error && <Typography color="error">{error}</Typography>}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px', mb: 2, backgroundColor: 'white', borderRadius: 1, boxShadow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography sx={{ color: 'grey' }}>{count} Selected</Typography>
                        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} size="small" onClick={handleBulkDeleteClick} disabled={count === 0}>
                            Delete
                        </Button>
                        <TablePagination
                            sx={{ marginLeft: 'auto' }}
                            rowsPerPageOptions={[]}
                            component="div"
                            count={tableData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Box>

                    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 1000 }}> {/* Set a minimum width for the table */}
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}></TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Business Names</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>E-mail</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Contact</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Date</TableCell>
                                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>WABA Number Status</TableCell>
                                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>Subscription Status</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Start Date</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>End Date</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Balance</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Active/Disabled</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {visibleRows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell padding="checkbox" sx={{ whiteSpace: 'nowrap' }}>
                                               <Checkbox 
                                                size="small" 
                                                onChange={(e) => handleCheckboxChange(e, row.userId, row.wabaId)}
                                                checked={selectedAccounts.some(acc => 
                                                    acc.userId === row.userId && acc.wabaId === row.wabaId
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.business}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.email}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.contact}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.date}</TableCell>
                                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{row.wabaStatus}</TableCell>
                                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                            <span style={{ color: row.PlanStatus === "Inactive" ? "gray" : "black" }}>
                                                {row.subscription}
                                            </span>
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.startDate|| "N/A"}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.endDate|| "N/A"}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.balance}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            <ToggleButton 
                                                userId={row.userId} 
                                                wabaId={row.wabaId} 
                                                planStatus={row.PlanStatus}
                                                onUpdate={(id, waba, newStatus) => {
                                                    setTableData(prevData => 
                                                        prevData.map(item => 
                                                            item.userId === id && item.wabaId === waba
                                                                ? { ...item, PlanStatus: newStatus }
                                                                : item
                                                        )
                                                    );
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                {row.accStatus === "DELETED" ? (
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleRestoreClick(row.userId, row.wabaId)}
                                                    >
                                                        Restore
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        startIcon={<DeleteIcon />}
                                                        sx={{ mr: 1 }}
                                                        onClick={() => handleDeleteClick(row.userId, row.wabaId)} // Open confirmation dialog
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                                <Dropdown userId={row.userId} wabaId={row.wabaId} disabled={row.accStatus === "DELETED"} />
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this user?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteConfirm} color="error">
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Restore Confirmation Dialog */}
                <Dialog open={restoreDialogOpen} onClose={handleRestoreDialogClose}>
                    <DialogTitle>Confirm Restoration</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to restore this user?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleRestoreDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleRestoreConfirm} color="success">
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={bulkDeleteDialogOpen} onClose={() => setBulkDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Bulk Deletion</DialogTitle>
        <DialogContent>
            <Typography>
                Are you sure you want to delete {selectedAccounts.length} selected account(s)?
            </Typography>
            {selectedAccounts.length > 5 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    (Showing first 5 of {selectedAccounts.length} selected accounts)
                </Typography>
            )}
            <Box sx={{ maxHeight: 200, overflow: 'auto', mt: 2 }}>
                {selectedAccounts.slice(0, 5).map((account, index) => (
                    <Typography key={index} variant="body2">
                        • User ID: {account.userId}, WABA ID: {account.wabaId}
                    </Typography>
                ))}
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setBulkDeleteDialogOpen(false)} color="primary">
                Cancel
            </Button>
            <Button onClick={handleBulkDeleteConfirm} color="error">
                Confirm Delete
            </Button>
        </DialogActions>
    </Dialog>

                {/* Newpage Modal */}
                <Newpage open={newPageOpen} handleClose={handleNewPageClose} onSubmit={handleCreateAccount}/>
            </Box>
        );
    };

    export default Navbar1;