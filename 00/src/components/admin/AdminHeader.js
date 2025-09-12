import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Badge, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  Button,
  Tooltip
} from '@mui/material';
import { 
  Notifications, 
  AccountCircle, 
  Logout, 
  Person,
  Settings,
  Help,
  Dashboard
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { themeColors } from '../../theme/Colors';

const AdminHeader = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleProfileClick = () => {
    navigate('/admin/profile');
    handleClose();
  };

  const handleDashboardClick = () => {
    navigate('/admin/dashboard');
    handleClose();
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: themeColors.neutral.surface,
        color: themeColors.neutral.text.primary,
        boxShadow: themeColors.shadow.light,
        borderBottom: `1px solid ${themeColors.neutral.border}`,
        backgroundImage: 'none',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            color: themeColors.primary.main,
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}
        >
          Welcome to Fruit Design Admin Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Dashboard">
            <IconButton
              onClick={handleDashboardClick}
              sx={{ 
                color: themeColors.neutral.text.secondary,
                mr: 1,
                '&:hover': { 
                  backgroundColor: themeColors.primary.lighter,
                  color: themeColors.primary.main
                }
              }}
            >
              <Dashboard />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Profile">
            <Button
              startIcon={<Person />}
              onClick={handleProfileClick}
              sx={{ 
                color: themeColors.neutral.text.secondary,
                mr: 2,
                '&:hover': { 
                  backgroundColor: themeColors.primary.lighter,
                  color: themeColors.primary.main
                }
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ display: { xs: 'none', md: 'block' } }}
              >
                Profile
              </Typography>
            </Button>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              sx={{ 
                color: themeColors.neutral.text.secondary,
                mr: 1,
                '&:hover': { 
                  backgroundColor: themeColors.primary.lighter,
                  color: themeColors.primary.main
                }
              }}
            >
              <Badge badgeContent={4} color="secondary">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Account">
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ 
                color: themeColors.neutral.text.secondary,
                '&:hover': { 
                  backgroundColor: themeColors.primary.lighter,
                  color: themeColors.primary.main
                }
              }}
            >
              <Avatar 
                alt={currentUser?.name || 'Admin'} 
                src="/static/images/avatar/1.jpg"
                sx={{ 
                  border: `2px solid ${themeColors.primary.main}`,
                  boxShadow: themeColors.shadow.light,
                  width: 36,
                  height: 36
                }}
              />
            </IconButton>
          </Tooltip>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
            sx={{
              mt: 1,
              '& .MuiPaper-root': {
                borderRadius: '12px',
                boxShadow: themeColors.shadow.medium,
                border: `1px solid ${themeColors.neutral.border}`,
                overflow: 'hidden',
                minWidth: 200
              }
            }}
          >
            <MenuItem 
              onClick={handleProfileClick}
              sx={{ 
                '&:hover': { backgroundColor: themeColors.primary.lighter },
                py: 1.5,
                px: 2
              }}
            >
              <AccountCircle sx={{ mr: 1, color: themeColors.primary.main }} /> Profile
            </MenuItem>
            <MenuItem 
              onClick={handleClose}
              sx={{ 
                '&:hover': { backgroundColor: themeColors.primary.lighter },
                py: 1.5,
                px: 2
              }}
            >
              <Logout sx={{ mr: 1, color: themeColors.primary.main }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;