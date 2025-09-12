import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Grid, 
  InputAdornment,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Paper,
  Stack
} from '@mui/material';
import { 
  Person, 
  Email, 
  Phone, 
  LocationOn, 
  Edit, 
  Save,
  Cancel,
  Cake,
  Work,
  Security,
  Notifications,
  Settings
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { themeColors } from '../../theme/Colors';

const AdminProfile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    joinDate: '',
    lastLogin: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      setProfileData({
        name: currentUser?.name || 'Admin User',
        email: currentUser?.email || 'admin@fruitdesign.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        joinDate: '2020-01-15',
        lastLogin: '2023-05-20'
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      console.log('Saving profile data:', profileData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    fetchProfileData();
    setIsEditing(false);
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: themeColors.primary.main }}>
          Admin Profile
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage your personal information and account settings
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {/* Left Column - Admin Profile (25% width) */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            borderRadius: '16px', 
            boxShadow: themeColors.shadow.light,
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Profile Header */}
            <Box sx={{ 
              p: 3, 
              pt: 5, 
              background: themeColors.gradient.primary,
              color: 'white',
              textAlign: 'center',
              position: 'relative'
            }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{
                  '& .MuiBadge-badge': {
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: themeColors.status.success,
                    border: `2px solid white`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                }}
                badgeContent={<Person sx={{ fontSize: 16, color: 'white' }} />}
              >
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    border: `4px solid white`,
                    boxShadow: themeColors.shadow.medium,
                    backgroundColor: 'white',
                    color: themeColors.primary.main,
                    fontSize: '2.5rem',
                    mb: 2
                  }}
                >
                  {profileData.name.charAt(0)}
                </Avatar>
              </Badge>
              
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {profileData.name}
              </Typography>
              
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Administrator
              </Typography>
            </Box>
            
            {/* Account Details */}
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: themeColors.neutral.text.primary, mb: 2 }}>
                Account Details
              </Typography>
              
              <Paper elevation={0} sx={{ 
                p: 2, 
                borderRadius: '12px', 
                backgroundColor: themeColors.neutral.surface,
                border: `1px solid ${themeColors.neutral.divider}`
              }}>
                <List dense disablePadding>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Cake sx={{ color: themeColors.neutral.text.secondary }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Joined" 
                      secondary={profileData.joinDate}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Work sx={{ color: themeColors.neutral.text.secondary }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Last Login" 
                      secondary={profileData.lastLogin}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                </List>
              </Paper>
              
            </CardContent>
          </Card>
        </Grid>
        
        {/* Right Column - Personal Information (60% width) */}
        <Grid item xs={12} md={7.2}>
          <Card sx={{ 
            borderRadius: '16px', 
            boxShadow: themeColors.shadow.light,
            overflow: 'hidden'
          }}>
            {/* Card Header with Title and Actions */}
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Settings sx={{ mr: 1, color: themeColors.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Personal Information
                  </Typography>
                </Box>
              }
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {isEditing ? (
                    <>
                      <Button 
                        variant="outlined" 
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        sx={{ 
                          borderColor: themeColors.primary.main,
                          color: themeColors.primary.main,
                          '&:hover': { 
                            backgroundColor: `${themeColors.primary.main}10`
                          },
                          borderRadius: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained" 
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={submitting}
                        sx={{ 
                          background: themeColors.gradient.primary,
                          '&:hover': { background: themeColors.primary.dark },
                          borderRadius: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Save'}
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={() => setIsEditing(true)}
                      sx={{ 
                        background: themeColors.gradient.primary,
                        '&:hover': { background: themeColors.primary.dark },
                        borderRadius: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              }
              sx={{ 
                backgroundColor: themeColors.neutral.surface,
                borderBottom: `1px solid ${themeColors.neutral.divider}`
              }}
            />
            
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Update your personal information and contact details
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
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
                    fullWidth
                    label="Email Address"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
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
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
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
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={profileData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
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
              
              {/* Contact Information Preview */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: themeColors.neutral.text.primary, mb: 2 }}>
                  Contact Information
                </Typography>
                
                <Paper elevation={0} sx={{ 
                  p: 2, 
                  borderRadius: '12px', 
                  backgroundColor: themeColors.neutral.surface,
                  border: `1px solid ${themeColors.neutral.divider}`
                }}>
                  <List dense disablePadding>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Email sx={{ color: themeColors.neutral.text.secondary }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={profileData.email}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Phone sx={{ color: themeColors.neutral.text.secondary }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Phone" 
                        secondary={profileData.phone}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LocationOn sx={{ color: themeColors.neutral.text.secondary }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Location" 
                        secondary={profileData.location}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminProfile;