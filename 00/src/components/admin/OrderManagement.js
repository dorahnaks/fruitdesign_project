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
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Avatar,
  Badge,
  Fab
} from '@mui/material';
import { Search, Add, Edit, Delete, Visibility, Receipt, LocalShipping, CheckCircle, Pending, Schedule, Person } from '@mui/icons-material';
import { themeColors } from '../../theme/Colors';

const orderStatuses = [
  { name: 'Pending', color: themeColors.status.warning, icon: <Pending fontSize="small" /> },
  { name: 'Processing', color: themeColors.status.info, icon: <Schedule fontSize="small" /> },
  { name: 'Shipped', color: themeColors.primary.main, icon: <LocalShipping fontSize="small" /> },
  { name: 'Delivered', color: themeColors.status.success, icon: <CheckCircle fontSize="small" /> },
  { name: 'Cancelled', color: themeColors.status.error, icon: <Receipt fontSize="small" /> },
];

const OrderManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Mock data for now
      setOrders([
        { id: 1, customerId: 1, customerName: 'Dorothy', orderDate: '2023-05-15', status: 'Delivered', totalAmount: 45.99, items: 3 },
        { id: 2, customerId: 2, customerName: 'Whitney', orderDate: '2023-05-16', status: 'Processing', totalAmount: 32.50, items: 2 },
        { id: 3, customerId: 3, customerName: 'Haula', orderDate: '2023-05-17', status: 'Shipped', totalAmount: 78.25, items: 5 },
        { id: 4, customerId: 1, customerName: 'Denise', orderDate: '2023-05-18', status: 'Delivered', totalAmount: 56.75, items: 4 },
        { id: 5, customerId: 4, customerName: 'Viola', orderDate: '2023-05-19', status: 'Pending', totalAmount: 29.99, items: 2 },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleOpen = (order = null) => {
    setCurrentOrder(order || { customerId: '', orderDate: '', status: 'Pending', totalAmount: '' });
    setIsEditing(!!order);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentOrder(null);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (isEditing) {
        setOrders(orders.map(o => o.id === currentOrder.id ? currentOrder : o));
      } else {
        setOrders([...orders, { ...currentOrder, id: orders.length + 1 }]);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setOrders(orders.filter(order => order.id !== id));
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentOrder({ ...currentOrder, [name]: value });
  };

  const getStatusInfo = (status) => {
    return orderStatuses.find(s => s.name === status) || orderStatuses[0];
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
            Order Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Track and manage customer orders efficiently
          </Typography>
        </Box>
      </Box>
      
      {/* Search and Filter */}
      <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: themeColors.shadow.light }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search orders..."
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
                      boxShadow: `0 0 0 2px rgba(46, 125, 50, 0.2)`,
                    },
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    borderRadius: '12px',
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {orderStatuses.map(status => (
                    <MenuItem key={status.name} value={status.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box component="span" sx={{ mr: 1, color: status.color }}>
                          {status.icon}
                        </Box>
                        {status.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: themeColors.shadow.light }}>
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: themeColors.primary.lighter }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <TableRow key={order.id} hover sx={{ '&:hover': { backgroundColor: themeColors.primary.lighter } }}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: themeColors.neutral.text.primary }}>
                        #{order.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ 
                          mr: 2, 
                          backgroundColor: themeColors.primary.main,
                          color: themeColors.neutral.text.light,
                          boxShadow: themeColors.shadow.light,
                          width: 36,
                          height: 36
                        }}>
                          {order.customerName.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" color="textSecondary">
                          {order.customerName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {order.orderDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${order.items} items`}
                        size="small"
                        sx={{ 
                          backgroundColor: `${themeColors.primary.main}20`,
                          color: themeColors.primary.main,
                          fontWeight: 'bold',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={statusInfo.icon}
                        label={order.status} 
                        size="small"
                        sx={{ 
                          backgroundColor: `${statusInfo.color}20`,
                          color: statusInfo.color,
                          fontWeight: 'bold',
                          borderRadius: '6px',
                          '& .MuiChip-icon': {
                            color: statusInfo.color,
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: themeColors.neutral.text.primary }}>
                        ${order.totalAmount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleOpen(order)} 
                        sx={{ 
                          color: themeColors.primary.main,
                          '&:hover': { backgroundColor: `${themeColors.primary.main}10` }
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(order.id)} 
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      
      {/* Add Order Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpen()}
          sx={{ 
            backgroundColor: themeColors.primary.main,
            '&:hover': { backgroundColor: themeColors.primary.dark },
            boxShadow: themeColors.shadow.light,
            borderRadius: '12px',
            px: 4,
            py: 1.5,
            fontSize: '1rem'
          }}
        >
          Add New Order
        </Button>
      </Box>
      
      {/* Order Dialog */}
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
          <Receipt sx={{ mr: 1 }} />
          {isEditing ? 'Edit Order' : 'Add New Order'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Customer</InputLabel>
                <Select
                  name="customerId"
                  value={currentOrder?.customerId || ''}
                  label="Customer"
                  onChange={handleChange}
                  sx={{
                    borderRadius: '12px',
                  }}
                >
                  <MenuItem value={1}>John Doe</MenuItem>
                  <MenuItem value={2}>Jane Smith</MenuItem>
                  <MenuItem value={3}>Robert Johnson</MenuItem>
                  <MenuItem value={4}>Emily Davis</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="orderDate"
                label="Order Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={currentOrder?.orderDate || ''}
                onChange={handleChange}
                InputProps={{
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={currentOrder?.status || ''}
                  label="Status"
                  onChange={handleChange}
                  sx={{
                    borderRadius: '12px',
                  }}
                >
                  {orderStatuses.map(status => (
                    <MenuItem key={status.name} value={status.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box component="span" sx={{ mr: 1, color: status.color }}>
                          {status.icon}
                        </Box>
                        {status.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="totalAmount"
                label="Total Amount ($)"
                type="number"
                fullWidth
                variant="outlined"
                value={currentOrder?.totalAmount || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="body1" sx={{ color: themeColors.neutral.text.secondary }}>
                        $
                      </Typography>
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
              backgroundColor: themeColors.primary.main,
              '&:hover': { backgroundColor: themeColors.primary.dark },
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

export default OrderManagement;