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
  useMediaQuery,
  useTheme,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Fab
} from '@mui/material';
import { Search, Add, Edit, Delete, VpnKey, AdminPanelSettings, Email, Person } from '@mui/icons-material';
import { themeColors } from '../../theme/Colors';

const AdminManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      // Mock data for now
      setAdmins([
        { id: 1, username: 'admin', email: 'admin@fruitdesign.com', role: 'Super Admin', lastLogin: '2023-05-20 10:30 AM' },
        { id: 2, username: 'dorothy', email: 'dorothy@fruitdesign.com', role: 'Admin', lastLogin: '2023-05-19 03:45 PM' },
        { id: 3, username: 'jovia', email: 'jovia@fruitdesign.com', role: 'Admin', lastLogin: '2023-05-18 09:15 AM' },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpen = (admin = null) => {
    setCurrentAdmin(admin || { username: '', email: '', password: '', role: 'Admin' });
    setIsEditing(!!admin);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentAdmin(null);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (isEditing) {
        setAdmins(admins.map(a => a.id === currentAdmin.id ? currentAdmin : a));
      } else {
        setAdmins([...admins, { ...currentAdmin, id: admins.length + 1 }]);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving admin:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setAdmins(admins.filter(admin => admin.id !== id));
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentAdmin({ ...currentAdmin, [name]: value });
  };

  const getRoleColor = (role) => {
    return role === 'Super Admin' ? themeColors.secondary.main : themeColors.primary.main;
  };

  const getRoleIcon = (role) => {
    return role === 'Super Admin' ? <AdminPanelSettings fontSize="small" /> : <VpnKey fontSize="small" />;
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
            Admin Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage system administrators and their permissions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge 
            badgeContent={admins.length}
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                height: '24px',
                minWidth: '24px',
                borderRadius: '12px',
              }
            }}
          >
            <AdminPanelSettings sx={{ mr: 1, color: themeColors.primary.main }} />
          </Badge>
          <Typography variant="h6" sx={{ color: themeColors.primary.main, fontWeight: 'bold' }}>
            Admin Team
          </Typography>
        </Box>
      </Box>
      
      {/* Search Bar */}
      <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: themeColors.shadow.light }}>
        <CardContent sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search admins..."
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
      
      {/* Admins Table */}
      <Card sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: themeColors.shadow.light }}>
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: themeColors.primary.lighter }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Admin</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Last Login</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary.dark }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id} hover sx={{ '&:hover': { backgroundColor: themeColors.primary.lighter } }}>
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
                        {admin.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: '500' }}>
                          {admin.username}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {admin.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 1, color: themeColors.neutral.text.secondary, fontSize: '1rem' }} />
                      <Typography variant="body2" color="textSecondary">
                        {admin.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={getRoleIcon(admin.role)}
                      label={admin.role} 
                      size="small"
                      sx={{ 
                        backgroundColor: `${getRoleColor(admin.role)}20`,
                        color: getRoleColor(admin.role),
                        fontWeight: 'bold',
                        borderRadius: '6px',
                        '& .MuiChip-icon': {
                          color: getRoleColor(admin.role),
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {admin.lastLogin}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleOpen(admin)} 
                      sx={{ 
                        color: themeColors.primary.main,
                        '&:hover': { backgroundColor: `${themeColors.primary.main}10` }
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(admin.id)} 
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
      
      {/* Add Admin Button */}
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
          Add New Admin
        </Button>
      </Box>
      
      {/* Admin Dialog */}
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
          <AdminPanelSettings sx={{ mr: 1 }} />
          {isEditing ? 'Edit Admin' : 'Add New Admin'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="username"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              value={currentAdmin?.username || ''}
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
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={currentAdmin?.email || ''}
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
            {!isEditing && (
              <TextField
                name="password"
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={currentAdmin?.password || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKey sx={{ color: themeColors.neutral.text.secondary }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={currentAdmin?.role || 'Admin'}
                label="Role"
                onChange={handleChange}
                sx={{
                  borderRadius: '12px',
                }}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Super Admin">Super Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
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

export default AdminManagement;