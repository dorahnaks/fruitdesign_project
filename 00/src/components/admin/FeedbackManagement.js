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
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Box,
  Typography,
  InputAdornment,
  Chip,
  Avatar,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Button,
  CircularProgress,
  Alert,
  Badge
} from '@mui/material';
import { Search, Delete, MarkEmailRead, Reply, Star, RateReview, Message } from '@mui/icons-material';
import { themeColors } from '../../theme/Colors';
import feedbackAPI from '../../api/FeedbackAPI';
import { useNavigate } from 'react-router-dom';

const FeedbackManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Define fallback rating colors
  const ratingColors = {
    filled: themeColors.rating?.filled || '#FFD700', // Gold color for filled stars
    empty: themeColors.rating?.empty || '#E0E0E0'   // Light gray for empty stars
  };

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      // Redirect to login after a short delay
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Decode token to get user role
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserRole(decodedToken.role);
    } catch (e) {
      console.error('Error decoding token:', e);
      setError('Invalid authentication token. Please log in again.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
  }, [navigate]);

  // Fetch feedback data
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        
        // Fetch feedback based on user role
        let feedbackData;
        if (userRole === 'customer') {
          feedbackData = await feedbackAPI.getMyFeedback();
        } else {
          feedbackData = await feedbackAPI.getAllFeedback();
        }
        
        // Transform API data to component format
        const transformedData = feedbackData.map(fb => ({
          id: fb.id,
          customerId: fb.customer_id,
          customerName: `Customer ${fb.customer_id}`, // Replace with actual name if available
          message: fb.message,
          rating: fb.rating || 0,
          submittedAt: fb.submitted_at,
          status: 'Unread' // Default status since backend doesn't provide it
        }));
        
        setFeedbacks(transformedData);
        setFilteredFeedbacks(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
        setError('Failed to load feedback data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      fetchFeedbacks();
    }
  }, [userRole]);

  // Filter feedbacks based on search term
  useEffect(() => {
    if (feedbacks.length > 0) {
      const filtered = feedbacks.filter(feedback =>
        feedback.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFeedbacks(filtered);
    }
  }, [searchTerm, feedbacks]);

  const handleOpen = async (feedback) => {
    try {
      const feedbackDetails = await feedbackAPI.getFeedbackById(feedback.id);
      
      setCurrentFeedback({
        ...feedback,
        fullMessage: feedbackDetails.message
      });
      setResponse('');
      setOpen(true);
    } catch (err) {
      console.error('Error fetching feedback details:', err);
      setError('Failed to load feedback details. Please try again.');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentFeedback(null);
  };

  const handleDelete = (id) => {
    // Since backend doesn't have delete endpoint, we'll just remove from UI
    setFeedbacks(feedbacks.filter(feedback => feedback.id !== id));
  };

  const markAsRead = (id) => {
    setFeedbacks(feedbacks.map(f => 
      f.id === id ? { ...f, status: 'Read' } : f
    ));
  };

  const handleSendResponse = () => {
    // Backend doesn't have response endpoint, so we'll just show a message
    alert(`Response sent to ${currentFeedback.customerName}: ${response}`);
    handleClose();
  };

  const getStatusColor = (status) => {
    return status === 'Unread' ? 'warning' : 'success';
  };

  const getStatusIcon = (status) => {
    return status === 'Unread' ? <MarkEmailRead fontSize="small" /> : <RateReview fontSize="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
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
        borderBottom: `1px solid ${themeColors.neutral?.divider || '#E0E0E0'}`
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: themeColors.primary?.main || '#4CAF50' }}>
            Feedback Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {userRole === 'customer' ? 'Your feedback history' : 'Listen to your customers and improve your products'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge 
            badgeContent={feedbacks.filter(f => f.status === 'Unread').length}
            color="warning"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                height: '24px',
                minWidth: '24px',
                borderRadius: '12px',
              }
            }}
          >
            <RateReview sx={{ mr: 1, color: themeColors.secondary?.main || '#2196F3' }} />
          </Badge>
          <Typography variant="h6" sx={{ color: themeColors.secondary?.main || '#2196F3', fontWeight: 'bold' }}>
            Customer Voices
          </Typography>
        </Box>
      </Box>
      
      {/* Search Bar - Only for admin users */}
      {userRole !== 'customer' && (
        <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: themeColors.shadow?.light || '0 2px 4px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: themeColors.neutral?.text?.secondary || '#757575' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '12px',
                  backgroundColor: themeColors.neutral?.surface || '#F5F5F5',
                  '&:hover': {
                    borderColor: themeColors.primary?.main || '#4CAF50',
                  },
                  '&.Mui-focused': {
                    borderColor: themeColors.primary?.main || '#4CAF50',
                    boxShadow: `0 0 0 2px rgba(76, 175, 80, 0.2)`,
                  },
                }
              }}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Feedback Table */}
      <Card sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: themeColors.shadow?.light || '0 2px 4px rgba(0,0,0,0.1)' }}>
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: themeColors.primary?.lighter || '#E8F5E9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary?.dark || '#2E7D32' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary?.dark || '#2E7D32' }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary?.dark || '#2E7D32' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary?.dark || '#2E7D32' }}>Date</TableCell>
                {userRole !== 'customer' && (
                  <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary?.dark || '#2E7D32' }}>Status</TableCell>
                )}
                <TableCell sx={{ fontWeight: 'bold', color: themeColors.primary?.dark || '#2E7D32' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFeedbacks.map((feedback) => (
                <TableRow key={feedback.id} hover sx={{ '&:hover': { backgroundColor: themeColors.primary?.lighter || '#E8F5E9' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        mr: 2, 
                        backgroundColor: themeColors.primary?.main || '#4CAF50',
                        color: themeColors.neutral?.text?.light || '#FFFFFF',
                        boxShadow: themeColors.shadow?.light || '0 2px 4px rgba(0,0,0,0.1)',
                        width: 48,
                        height: 48
                      }}>
                        {feedback.customerName.charAt(0)}
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: '500' }}>
                        {feedback.customerName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {feedback.message.length > 50 
                        ? `${feedback.message.substring(0, 50)}...` 
                        : feedback.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          fontSize="small" 
                          sx={{ 
                            color: i < feedback.rating ? ratingColors.filled : ratingColors.empty
                          }} 
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {feedback.submittedAt}
                    </Typography>
                  </TableCell>
                  {userRole !== 'customer' && (
                    <TableCell>
                      <Chip 
                        icon={getStatusIcon(feedback.status)}
                        label={feedback.status} 
                        color={getStatusColor(feedback.status)} 
                        size="small"
                        sx={{ 
                          fontWeight: 'bold',
                          borderRadius: '6px',
                          '& .MuiChip-icon': {
                            color: getStatusColor(feedback.status) === 'warning' ? '#FF9800' : '#4CAF50',
                          }
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <IconButton 
                      onClick={() => handleOpen(feedback)} 
                      sx={{ 
                        color: themeColors.primary?.main || '#4CAF50',
                        '&:hover': { backgroundColor: `${themeColors.primary?.main || '#4CAF50'}10` }
                      }}
                    >
                      <Reply />
                    </IconButton>
                    {userRole !== 'customer' && feedback.status === 'Unread' && (
                      <IconButton 
                        onClick={() => markAsRead(feedback.id)} 
                        sx={{ 
                          color: '#4CAF50',
                          '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                        }}
                      >
                        <MarkEmailRead />
                      </IconButton>
                    )}
                    {userRole !== 'customer' && (
                      <IconButton 
                        onClick={() => handleDelete(feedback.id)} 
                        sx={{ 
                          color: '#F44336',
                          '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      
      {/* Feedback Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="md"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            boxShadow: themeColors.shadow?.medium || '0 4px 8px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: themeColors.primary?.main || '#4CAF50', 
          color: themeColors.neutral?.text?.light || '#FFFFFF',
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center'
        }}>
          <RateReview sx={{ mr: 1 }} />
          Feedback Details
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {currentFeedback && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  mr: 2, 
                  backgroundColor: themeColors.primary?.main || '#4CAF50',
                  color: themeColors.neutral?.text?.light || '#FFFFFF',
                  boxShadow: themeColors.shadow?.light || '0 2px 4px rgba(0,0,0,0.1)',
                  width: 56,
                  height: 56
                }}>
                  {currentFeedback.customerName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {currentFeedback.customerName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Submitted on {currentFeedback.submittedAt}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>Rating:</Typography>
                    <Box sx={{ display: 'flex' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          fontSize="small" 
                          sx={{ 
                            color: i < currentFeedback.rating ? ratingColors.filled : ratingColors.empty
                          }} 
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Card sx={{ p: 2, mb: 2, backgroundColor: themeColors.primary?.lighter || '#E8F5E9', borderRadius: '12px' }}>
                <Typography variant="body1">{currentFeedback.fullMessage || currentFeedback.message}</Typography>
              </Card>
              {userRole !== 'customer' && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Your Response"
                  variant="outlined"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  sx={{ mt: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Message sx={{ color: themeColors.neutral?.text?.secondary || '#757575' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '12px',
                    }
                  }}
                />
              )}
            </Box>
          )}
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
            Close
          </Button>
          {userRole !== 'customer' && (
            <Button 
              onClick={handleSendResponse} 
              variant="contained" 
              sx={{ 
                backgroundColor: themeColors.primary?.main || '#4CAF50',
                '&:hover': { backgroundColor: themeColors.primary?.dark || '#2E7D32' },
                borderRadius: '12px',
                px: 3,
                py: 1,
                boxShadow: themeColors.shadow?.light || '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Send Response
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackManagement;