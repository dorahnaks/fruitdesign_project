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
  Chip,
  Alert
} from '@mui/material';
import { 
  Phone, 
  Email, 
  LocationOn, 
  Map, 
  Save,
  Public,
  ContactPhone
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import contactAPI from '../../api/ContactAPI';
import { themeColors } from '../../theme/Colors';

const ContactSettings = () => {
  const { token } = useAuth();
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    location: '',
    mapLink: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('unknown');

  useEffect(() => {
    const testConnection = async () => {
      try {
        await contactAPI.getContactInfo();
        setConnectionStatus('connected');
        fetchContactInfo();
      } catch (error) {
        setConnectionStatus('disconnected');
        setError('Cannot connect to the backend server. Please ensure it is running.');
        setLoading(false);
      }
    };
    
    testConnection();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactAPI.getContactInfo();
      
      setContactInfo({
        phone: response.phone || '',
        email: response.email || '',
        location: response.location || '',
        mapLink: response.map_link || '',
        socialMedia: response.social_media_links || {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: ''
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contact info:', error);
      setError('Failed to load contact information');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({ ...contactInfo, [name]: value });
  };

  const handleSocialChange = (platform, value) => {
    setContactInfo({
      ...contactInfo,
      socialMedia: {
        ...contactInfo.socialMedia,
        [platform]: value
      }
    });
  };

  const handleSave = async () => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const dataToSave = {
        phone: contactInfo.phone,
        email: contactInfo.email,
        location: contactInfo.location,
        map_link: contactInfo.mapLink,
        social_media_links: contactInfo.socialMedia
      };
      
      const response = await contactAPI.updateContactInfo(dataToSave, token);
      
      setSuccess(true);
      setIsEditing(false);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving contact info:', err);
      setError(err.message || 'Failed to update contact information');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    fetchContactInfo();
    setIsEditing(false);
    setError(null);
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
      {/* Connection Status */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          Backend Connection: 
          <span style={{ 
            color: connectionStatus === 'connected' ? 'green' : 'red',
            fontWeight: 'bold'
          }}>
            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
        </Typography>
      </Box>
      
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
            Contact Information Settings
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage how customers can reach your business
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ContactPhone sx={{ mr: 1, color: themeColors.secondary.main }} />
          <Typography variant="h6" sx={{ color: themeColors.secondary.main, fontWeight: 'bold' }}>
            Stay Connected
          </Typography>
        </Box>
      </Box>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Contact information saved successfully!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Card sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: themeColors.shadow.light }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary.main, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <ContactPhone sx={{ mr: 1 }} />
                Contact Details
              </Typography>
              
              <TextField
                fullWidth
                margin="normal"
                label="Phone Number"
                name="phone"
                value={contactInfo.phone}
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
              
              <TextField
                fullWidth
                margin="normal"
                label="Email Address"
                name="email"
                value={contactInfo.email}
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
              
              <TextField
                fullWidth
                margin="normal"
                label="Physical Location"
                name="location"
                value={contactInfo.location}
                onChange={handleChange}
                disabled={!isEditing}
                multiline
                rows={2}
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
              
              <TextField
                fullWidth
                margin="normal"
                label="Google Maps Link"
                name="mapLink"
                value={contactInfo.mapLink}
                onChange={handleChange}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Map sx={{ color: themeColors.neutral.text.secondary }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: themeColors.primary.main, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <Public sx={{ mr: 1 }} />
                Social Media Links
              </Typography>
              
              <TextField
                fullWidth
                margin="normal"
                label="Facebook"
                value={contactInfo.socialMedia.facebook}
                onChange={(e) => handleSocialChange('facebook', e.target.value)}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'grey', fontWeight: 'bold' }}>f</Box>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="X"
                value={contactInfo.socialMedia.twitter}
                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'grey', fontWeight: 'bold' }}>𝕏</Box>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Instagram"
                value={contactInfo.socialMedia.instagram}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: '#E1306C', fontWeight: 'bold' }}>📷</Box>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="LinkedIn"
                value={contactInfo.socialMedia.linkedin}
                onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: '#0077B5', fontWeight: 'bold' }}>in</Box>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: themeColors.primary.main, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              Preview
            </Typography>
            
            {!isEditing ? (
              <Button 
                variant="contained" 
                onClick={() => setIsEditing(true)}
                sx={{ 
                  backgroundColor: themeColors.primary.main,
                  '&:hover': { backgroundColor: themeColors.primary.dark },
                  boxShadow: themeColors.shadow.light,
                  borderRadius: '12px',
                  px: 3,
                  py: 1
                }}
              >
                Edit Information
              </Button>
            ) : (
              <Box>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel}
                  sx={{ 
                    mr: 2,
                    borderRadius: '12px',
                    px: 3,
                    py: 1,
                    borderColor: themeColors.primary.main,
                    color: themeColors.primary.main
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSave}
                  startIcon={<Save />}
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
                  {submitting ? <CircularProgress size={20} /> : 'Save Changes'}
                </Button>
              </Box>
            )}
          </Box>
          
          <Card sx={{ 
            padding: 3, 
            mt: 3, 
            backgroundColor: themeColors.primary.lighter,
            borderRadius: '16px',
            border: `1px solid ${themeColors.primary.main}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Phone sx={{ mr: 1, color: themeColors.primary.main }} />
              <Typography>{contactInfo.phone || 'No phone number'}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Email sx={{ mr: 1, color: themeColors.primary.main }} />
              <Typography>{contactInfo.email || 'No email address'}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ mr: 1, color: themeColors.primary.main }} />
              <Typography>{contactInfo.location || 'No location provided'}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Map sx={{ mr: 1, color: themeColors.primary.main }} />
              {contactInfo.mapLink ? (
                <Typography 
                  component="a" 
                  href={contactInfo.mapLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ color: themeColors.primary.main, textDecoration: 'none', fontWeight: '500' }}
                >
                  View on Google Maps
                </Typography>
              ) : (
                <Typography color="textSecondary">No map link provided</Typography>
              )}
            </Box>
            
            {/* Social Media Preview */}
            {(contactInfo.socialMedia.facebook || 
              contactInfo.socialMedia.twitter || 
              contactInfo.socialMedia.instagram || 
              contactInfo.socialMedia.linkedin) && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Public sx={{ mr: 1, color: themeColors.primary.main }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {contactInfo.socialMedia.facebook && (
                    <Chip label="Facebook" size="small" />
                  )}
                  {contactInfo.socialMedia.twitter && (
                    <Chip label="Twitter" size="small" />
                  )}
                  {contactInfo.socialMedia.instagram && (
                    <Chip label="Instagram" size="small" />
                  )}
                  {contactInfo.socialMedia.linkedin && (
                    <Chip label="LinkedIn" size="small" />
                  )}
                </Box>
              </Box>
            )}
          </Card>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ContactSettings;