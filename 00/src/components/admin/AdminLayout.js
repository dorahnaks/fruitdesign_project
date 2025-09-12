import React from 'react';
import { Box, Toolbar, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { themeColors } from '../../theme/Colors';

const AdminLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: themeColors.neutral.background,
    }}>
      <CssBaseline />
      <Sidebar />
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <AdminHeader />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 1, sm: 2, md: 3 },
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            backgroundColor: themeColors.neutral.background,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;