// src/components/admin/AdminRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const themeColors = {
  primary: '#2E7D32',
  background: '#F8F9FA',
};

const AdminRoute = ({ children }) => {
  const auth = useAuth();
  
  // If context is not available, redirect to login
  if (!auth) {
    return <Navigate to="/login" />;
  }
  
  const { currentUser, isAdmin, loading } = auth;
  
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: themeColors.background
      }}>
        <CircularProgress size={60} sx={{ color: themeColors.primary }} />
      </Box>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  return children;
};

export default AdminRoute;