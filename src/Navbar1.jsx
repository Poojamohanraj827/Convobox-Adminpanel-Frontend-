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
    DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleButton from "./Togglebutton";
import Dropdown from "./Dropdown";
import Newpage from "./Newpage"; // Import the Newpage component
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar1 = () => {
    const navigate = useNavigate();
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [tableData, setTableData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // State for delete confirmation dialog
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false); // State for restore confirmation dialog
    const [selectedUser, setSelectedUser] = useState({ userId: null, wabaId: null }); // Store selected user for deletion
    const [selectedRestoreUser, setSelectedRestoreUser] = useState({ userId: null, wabaId: null }); // Store selected user for restoration
    const [newPageOpen, setNewPageOpen] = useState(false); // State to control Newpage modal visibility

    // Function to format date as day-month-year
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0'); // Ensure 2 digits for day
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Fetch all accounts on initial load
    useEffect(() => {
        fetchAllAccounts();
    }, []);

    // Function to fetch all accounts
    const fetchAllAccounts = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/accounts/getAllAccounts');
            const mappedData = response.data.map((account, index) => ({
                id: index + 1,
                userId: account.userId,
                wabaId: account.wabaId,
                business: account.businessName,
                email: account.userEmail,
                contact: account.userPhone,
                date: formatDate(account.createdAt), // Format date
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
            console.error("Error fetching accounts:", error);
            setError("Failed to fetch accounts.");
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch balance for an account
    const fetchBalance = async (userId, wabaId) => {
        try {
            const response = await axios.post('http://localhost:5000/api/credit/getBalance', { userId, wabaId });
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
            const response = await axios.post('http://localhost:5000/api/admin/searchrecords', { businessName });
            const mappedData = response.data.accounts.map((account, index) => ({
                id: index + 1,
                userId: account.userId,
                wabaId: account.wabaId,
                business: account.businessName,
                email: account.userEmail,
                contact: account.userPhone,
                date: formatDate(account.createdAt), // Format date
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
    const handleCheckboxChange = (event) => {
        setCount(prev => event.target.checked ? prev + 1 : prev - 1);
    };

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
        axios.post('http://localhost:5000/api/accounts/deleteaccount', { userId, wabaId })
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
        axios.post('http://localhost:5000/api/accounts/restoreaccount', { userId, wabaId })
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

    // Calculate visible rows for pagination
    const visibleRows = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ paddingLeft: 7 }}>
            <Card variant="outlined" sx={{ mb: 3, width: '100%', borderWidth: '1px' }}>
                <CardContent>
                    <Typography variant="h5">Customers</Typography>
                </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Search"
                    InputProps={{ endAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} /> }}
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange} // Trigger search on input change
                />
                <Button
                    sx={{ backgroundColor: 'rgb(194, 39, 214)' }}
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNewPageOpen} // Open Newpage modal on button click
                >
                    New Customers
                </Button>
            </Box>

            {loading && <Typography>Loading...</Typography>}
            {error && <Typography color="error">{error}</Typography>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px', mb: 2, backgroundColor: 'white', borderRadius: 1, boxShadow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ color: 'grey' }}>{count} Selected</Typography>
                    <Button variant="outlined" color="error" startIcon={<DeleteIcon />} size="small">
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
                                        <Checkbox size="small" onChange={handleCheckboxChange} />
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
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.startDate}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.endDate}</TableCell>
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
                                            <Dropdown userId={row.userId} wabaId={row.wabaId} disabled={row.accStatus === "DELETED" || !row.wabaId} />
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

            {/* Newpage Modal */}
            <Newpage open={newPageOpen} handleClose={handleNewPageClose} />
        </Box>
    );
};

export default Navbar1;