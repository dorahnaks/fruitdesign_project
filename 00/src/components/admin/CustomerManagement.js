import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  IconButton, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Box,
  Typography,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  useMediaQuery,
  useTheme,
  Badge,
  Fab
} from '@mui/material';
import { Search, Add, Edit, Delete, Visibility, Email, Phone, LocationOn, Person } from '@mui/icons-material';
import { themeColors } from '../../theme/Colors';

const CustomerManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // Mock data for now
      setCustomers([
        { id: 1, name: 'Dorothy Naks', phone: '123-456-7890', email: 'john@example.com', address: '123 Main St', joinDate: '2022-01-15', lastOrder: '2023-05-10', totalOrders: 12, totalSpent: 456.78 },
        { id: 2, name: 'Julie K', phone: '987-654-3210', email: 'jane@example.com', address: '456 Oak Ave', joinDate: '2022-03-22', lastOrder: '2023-05-12', totalOrders: 8, totalSpent: 324.50 },
        { id: 3, name: 'Whitney Josephine', phone: '555-123-4567', email: 'robert@example.com', address: '789 Pine Rd', joinDate: '2021-11-05', lastOrder: '2023-05-05', totalOrders: 24, totalSpent: 876.32 },
        { id: 4, name: 'Sarah N', phone: '444-567-8901', email: 'emily@example.com', address: '321 Elm St', joinDate: '2022-07-18', lastOrder: '2023-05-15', totalOrders: 5, totalSpent: 189.75 },
        { id: 5, name: 'Faith Mercy', phone: '333-789-0123', email: 'michael@example.com', address: '654 Maple Dr', joinDate: '2023-02-28', lastOrder: '2023-05-14', totalOrders: 3, totalSpent: 98.40 },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleOpen = (customer = null) => {
    setCurrentCustomer(customer);
    setIsEditing(!!customer);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentCustomer(null);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (isEditing) {
        setCustomers(customers.map(c => c.id === currentCustomer.id ? currentCustomer : c));
      } else {
        setCustomers([...customers, { ...currentCustomer, id: customers.length + 1 }]);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setCustomers(customers.filter(customer => customer.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCustomer({ ...currentCustomer, [name]: value });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} sx={{ color: themeColors.primary.main }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: `1px solid ${themeColors.neutral.divider}`
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: themeColors.primary.main }}>
            Customer Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your valuable customers and their information
          </Typography>
        </Box>
      </Box>
      
      {/* Search Bar */}
      <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: themeColors.shadow.light }}>
        <CardContent sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: themeColors.neutral.text.secondary }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '12px',
                backgroundColor: themeColors.neutral.surface,
                '&:hover': {
                  borderColor: themeColors.primary.main,
                },
                '&.Mui-focused': {
                  borderColor: themeColors.primary.main,
                  boxShadow: `0 0 0 2px rgba(245, 124, 0, 0.2)`,
                },
              }
            }}
          />
        </CardContent>
      </Card>
      
      {/* Customers Table */}
      <Card sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: themeColors.shadow.light }}>
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: themeColors.primary.lighter }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Statistics</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} hover sx={{ '&:hover': { backgroundColor: themeColors.primary.lighter } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        mr: 2, 
                        backgroundColor: themeColors.primary.main,
                        color: themeColors.neutral.text.light,
                        boxShadow: themeColors.shadow.light,
                        width: 48,
                        height: 48
                      }}>
                        {customer.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: '500' }}>
                          {customer.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {customer.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email sx={{ mr: 1, color: themeColors.neutral.text.secondary, fontSize: '1rem' }} />
                        <Typography variant="body2" color="textSecondary">
                          {customer.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone sx={{ mr: 1, color: themeColors.neutral.text.secondary, fontSize: '1rem' }} />
                        <Typography variant="body2" color="textSecondary">
                          {customer.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 1, color: themeColors.neutral.text.secondary, fontSize: '1rem' }} />
                      <Typography variant="body2" color="textSecondary">
                        {customer.address}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: '500', mr: 1 }}>
                          Orders:
                        </Typography>
                        <Chip 
                          label={customer.totalOrders} 
                          size="small"
                          sx={{ 
                            backgroundColor: `${themeColors.primary.main}20`,
                            color: themeColors.primary.main,
                            fontWeight: 'bold',
                            borderRadius: '6px',
                            height: 24
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: '500', mr: 1 }}>
                          Spent:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: themeColors.secondary.main }}>
                          ${customer.totalSpent.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleOpen(customer)} 
                      sx={{ 
                        color: themeColors.primary.main,
                        '&:hover': { backgroundColor: `${themeColors.primary.main}10` }
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(customer.id)} 
                      sx={{ 
                        color: themeColors.status.error,
                        '&:hover': { backgroundColor: `${themeColors.status.error}10` }
                      }}
                    >
                      <Delete />
                    </IconButton>
                    <IconButton 
                      sx={{ 
                        color: themeColors.status.info,
                        '&:hover': { backgroundColor: `${themeColors.status.info}10` }
                      }}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      
      {/* Add Customer Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpen()}
          sx={{ 
            background: themeColors.gradient.primary,
            '&:hover': { background: themeColors.primary.dark },
            boxShadow: themeColors.shadow.light,
            borderRadius: '12px',
            px: 4,
            py: 1.5,
            fontSize: '1rem'
          }}
        >
          Add New Customer
        </Button>
      </Box>
      
      {/* Customer Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="sm"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            boxShadow: themeColors.shadow.medium,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: themeColors.primary.main, 
          color: themeColors.neutral.text.light,
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Person sx={{ mr: 1 }} />
          {isEditing ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Name"
                type="text"
                fullWidth
                variant="outlined"
                value={currentCustomer?.name || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: themeColors.neutral.text.secondary }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone"
                type="text"
                fullWidth
                variant="outlined"
                value={currentCustomer?.phone || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: themeColors.neutral.text.secondary }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={currentCustomer?.email || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: themeColors.neutral.text.secondary }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                type="text"
                fullWidth
                variant="outlined"
                value={currentCustomer?.address || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: themeColors.neutral.text.secondary }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              borderRadius: '12px',
              px: 3,
              py: 1
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            sx={{ 
              background: themeColors.gradient.primary,
              '&:hover': { background: themeColors.primary.dark },
              borderRadius: '12px',
              px: 3,
              py: 1,
              boxShadow: themeColors.shadow.light
            }}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : (isEditing ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerManagement;