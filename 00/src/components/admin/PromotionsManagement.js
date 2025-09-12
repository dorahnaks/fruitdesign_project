import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  TextField, 
  IconButton, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Box,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
  useMediaQuery,
  useTheme,
  Chip,
  Badge,
  Fab,
  Tooltip,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Search, Add, Edit, Delete, Visibility, LocalOffer, Percent, CalendarToday, AttachMoney, ViewModule, ViewList } from '@mui/icons-material';
import { themeColors } from '../../theme/Colors';

const PromotionsManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      // Mock data for now
      setPromotions([
        { id: 1, title: 'Summer Fruit Sale', description: 'Get 20% off on all summer fruits', discount: 20, type: 'Percentage', startDate: '2023-06-01', endDate: '2023-06-30', status: 'Active', code: 'SUMMER20' },
        { id: 2, title: 'Juice Bundle Deal', description: 'Buy 2 juices get 1 free', discount: 0, type: 'Buy One Get One', startDate: '2023-05-15', endDate: '2023-06-15', status: 'Active', code: 'JUICEBOGO' },
        { id: 3, title: 'New Customer Discount', description: '$10 off your first order', discount: 10, type: 'Fixed Amount', startDate: '2023-05-01', endDate: '2023-12-31', status: 'Active', code: 'NEW10' },
        { id: 4, title: 'Organic Week', description: '15% off on all organic products', discount: 15, type: 'Percentage', startDate: '2023-04-10', endDate: '2023-04-17', status: 'Expired', code: 'ORGANIC15' },
        { id: 5, title: 'Weekend Special', description: 'Free delivery on orders over $50', discount: 0, type: 'Free Shipping', startDate: '2023-05-20', endDate: '2023-05-21', status: 'Scheduled', code: 'WEEKEND' },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setLoading(false);
    }
  };

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          promotion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          promotion.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? promotion.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleOpen = (promotion = null) => {
    setCurrentPromotion(promotion || { 
      title: '', 
      description: '', 
      discount: 0, 
      type: 'Percentage', 
      startDate: '', 
      endDate: '', 
      status: 'Scheduled', 
      code: '' 
    });
    setIsEditing(!!promotion);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentPromotion(null);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (isEditing) {
        setPromotions(promotions.map(p => p.id === currentPromotion.id ? currentPromotion : p));
      } else {
        setPromotions([...promotions, { ...currentPromotion, id: promotions.length + 1 }]);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving promotion:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setPromotions(promotions.filter(promotion => promotion.id !== id));
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPromotion({ ...currentPromotion, [name]: value });
  };

  const handleStatusToggle = (id, newStatus) => {
    setPromotions(promotions.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return themeColors.status.success;
      case 'Scheduled': return themeColors.primary.main;
      case 'Expired': return themeColors.status.error;
      default: return themeColors.neutral.text.secondary;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Percentage': return <Percent fontSize="small" />;
      case 'Fixed Amount': return <AttachMoney fontSize="small" />;
      case 'Buy One Get One': return <LocalOffer fontSize="small" />;
      case 'Free Shipping': return <CalendarToday fontSize="small" />;
      default: return <LocalOffer fontSize="small" />;
    }
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
            Promotions Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create and manage promotional campaigns
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Grid View">
            <IconButton 
              onClick={() => setViewMode('grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              <ViewModule />
            </IconButton>
          </Tooltip>
          <Tooltip title="List View">
            <IconButton 
              onClick={() => setViewMode('list')}
              color={viewMode === 'list' ? 'primary' : 'default'}
            >
              <ViewList />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', boxShadow: themeColors.shadow.light }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search promotions..."
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
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Promotions Grid/List */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredPromotions.map((promotion) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={promotion.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: '16px',
                boxShadow: themeColors.shadow.light,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': { 
                  transform: 'translateY(-5px)', 
                  boxShadow: themeColors.shadow.hover,
                },
                overflow: 'hidden',
                position: 'relative'
              }}>
                {/* Status Badge */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 12, 
                  right: 12,
                  zIndex: 1
                }}>
                  <Chip 
                    label={promotion.status}
                    size="small"
                    sx={{ 
                      backgroundColor: `${getStatusColor(promotion.status)}20`,
                      color: getStatusColor(promotion.status),
                      fontWeight: 'bold',
                      borderRadius: '6px',
                    }}
                  />
                </Box>
                
                <CardMedia
                  component="div"
                  sx={{ 
                    height: 120, 
                    backgroundColor: themeColors.primary.lighter, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundImage: `linear-gradient(45deg, ${themeColors.primary.main}20, ${themeColors.secondary.main}20)`,
                    position: 'relative'
                  }}
                >
                  <LocalOffer sx={{ fontSize: 48, color: themeColors.primary.main }} />
                </CardMedia>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                  <Typography gutterBottom variant="h6" component="div" fontWeight="bold" color={themeColors.neutral.text.primary}>
                    {promotion.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1, flexGrow: 1 }}>
                    {promotion.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getTypeIcon(promotion.type)}
                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                      {promotion.type}
                    </Typography>
                  </Box>
                  
                  {promotion.discount > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: themeColors.secondary.main }}>
                        {promotion.type === 'Percentage' ? `${promotion.discount}% off` : `$${promotion.discount} off`}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      Code: <span style={{ fontWeight: 'bold', color: themeColors.primary.main }}> {promotion.code}</span>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      {promotion.startDate} to {promotion.endDate}
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ 
                  p: 1, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  backgroundColor: themeColors.primary.lighter 
                }}>
                  <IconButton 
                    onClick={() => handleOpen(promotion)} 
                    sx={{ 
                      color: themeColors.primary.main,
                      '&:hover': { backgroundColor: `${themeColors.primary.main}10` }
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(promotion.id)} 
                    sx={{ 
                      color: themeColors.status.error,
                      '&:hover': { backgroundColor: `${themeColors.status.error}10` }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: themeColors.shadow.light }}>
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead sx={{ backgroundColor: themeColors.primary.lighter }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Promotion</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Discount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPromotions.map((promotion) => (
                  <TableRow key={promotion.id} hover sx={{ '&:hover': { backgroundColor: themeColors.primary.lighter } }}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: '500' }}>
                        {promotion.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {promotion.description.length > 30 ? `${promotion.description.substring(0, 30)}...` : promotion.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getTypeIcon(promotion.type)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {promotion.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: themeColors.secondary.main }}>
                        {promotion.discount > 0 ? (promotion.type === 'Percentage' ? `${promotion.discount}%` : `$${promotion.discount}`) : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: themeColors.primary.main }}>
                        {promotion.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {promotion.startDate} to {promotion.endDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={promotion.status === 'Active'}
                            onChange={(e) => handleStatusToggle(promotion.id, e.target.checked ? 'Active' : 'Scheduled')}
                            color="primary"
                          />
                        }
                        label={promotion.status}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleOpen(promotion)} 
                        sx={{ 
                          color: themeColors.primary.main,
                          '&:hover': { backgroundColor: `${themeColors.primary.main}10` }
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(promotion.id)} 
                        sx={{ 
                          color: themeColors.status.error,
                          '&:hover': { backgroundColor: `${themeColors.status.error}10` }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
      
      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpen()}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: themeColors.gradient.primary,
          '&:hover': {
            background: themeColors.primary.dark,
          }
        }}
      >
        <Add />
      </Fab>
      
      {/* Promotion Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="md"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            boxShadow: themeColors.shadow.medium,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: themeColors.gradient.primary,
          color: themeColors.neutral.text.light,
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center'
        }}>
          <LocalOffer sx={{ mr: 1 }} />
          {isEditing ? 'Edit Promotion' : 'Add New Promotion'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Promotion Title"
                type="text"
                fullWidth
                variant="outlined"
                value={currentPromotion?.title || ''}
                onChange={handleChange}
                InputProps={{
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={currentPromotion?.description || ''}
                onChange={handleChange}
                InputProps={{
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Promotion Type</InputLabel>
                <Select
                  name="type"
                  value={currentPromotion?.type || 'Percentage'}
                  label="Promotion Type"
                  onChange={handleChange}
                  sx={{
                    borderRadius: '12px',
                  }}
                >
                  <MenuItem value="Percentage">Percentage Discount</MenuItem>
                  <MenuItem value="Fixed Amount">Fixed Amount</MenuItem>
                  <MenuItem value="Buy One Get One">Buy One Get One</MenuItem>
                  <MenuItem value="Free Shipping">Free Shipping</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="discount"
                label="Discount Value"
                type="number"
                fullWidth
                variant="outlined"
                value={currentPromotion?.discount || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {currentPromotion?.type === 'Percentage' ? 
                        <Percent sx={{ color: themeColors.neutral.text.secondary }} /> : 
                        <AttachMoney sx={{ color: themeColors.neutral.text.secondary }} />
                      }
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
                name="startDate"
                label="Start Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={currentPromotion?.startDate || ''}
                onChange={handleChange}
                InputProps={{
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="endDate"
                label="End Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={currentPromotion?.endDate || ''}
                onChange={handleChange}
                InputProps={{
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="code"
                label="Promo Code"
                type="text"
                fullWidth
                variant="outlined"
                value={currentPromotion?.code || ''}
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
                  value={currentPromotion?.status || 'Scheduled'}
                  label="Status"
                  onChange={handleChange}
                  sx={{
                    borderRadius: '12px',
                  }}
                >
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Expired">Expired</MenuItem>
                </Select>
              </FormControl>
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
              fontWeight: 'bold'
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

export default PromotionsManagement;