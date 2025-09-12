import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Box,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  People as CustomerIcon, 
  ShoppingCart as ProductIcon, 
  Receipt as OrderIcon, 
  Feedback as FeedbackIcon, 
  AdminPanelSettings as AdminIcon, 
  ContactMail as ContactIcon,
  Person as ProfileIcon,
  BarChart as AnalyticsIcon,
  LocalOffer as PromotionIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { themeColors } from '../../theme/Colors';
import logo from '../../images/logo.jpg';

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/admin/dashboard',
    color: themeColors.primary.main
  },
  { 
    text: 'Customers', 
    icon: <CustomerIcon />, 
    path: '/admin/customers',
    color: themeColors.status.info
  },
  { 
    text: 'Products', 
    icon: <ProductIcon />, 
    path: '/admin/products',
    color: themeColors.secondary.main
  },
  { 
    text: 'Orders', 
    icon: <OrderIcon />, 
    path: '/admin/orders',
    color: themeColors.status.warning
  },
  { 
    text: 'Content', 
    icon: <StoreIcon />, 
    path: '/admin/content',
    color: themeColors.accent.main
  },
  { 
    text: 'Feedback', 
    icon: <FeedbackIcon />, 
    path: '/admin/feedback',
    color: themeColors.accent.light
  },
  { 
    text: 'Admins', 
    icon: <AdminIcon />, 
    path: '/admin/admins',
    color: themeColors.status.error
  },
  { 
    text: 'Contact Info', 
    icon: <ContactIcon />, 
    path: '/admin/contact',
    color: themeColors.primary.dark
  },
  { 
    text: 'Profile', 
    icon: <ProfileIcon />, 
    path: '/admin/profile',
    color: themeColors.secondary.dark
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          backgroundColor: themeColors.neutral.surface,
          borderRight: `1px solid ${themeColors.neutral.border}`,
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
        },
      }}
    >
      {/* Logo and Branding */}
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        borderBottom: `1px solid ${themeColors.neutral.border}`,
        background: themeColors.gradient.primary,
        color: themeColors.neutral.text.light,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box 
          component="img"
          src={logo}
          alt="Fruit Design Logo"
          sx={{ 
            height: 80, 
            mb: 2,
            mx: 'auto',
            borderRadius: '50%',
            border: `3px solid ${themeColors.neutral.text.light}`,
            boxShadow: themeColors.shadow.medium
          }}
        />
        
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Fruit Design
        </Typography>
        <Typography variant="subtitle2">
          Admin Dashboard
        </Typography>
      </Box>
      
      {/* Navigation Menu */}
      <Box sx={{ pt: 2, pb: 3, overflow: 'auto', height: 'calc(100% - 180px)' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{ 
                py: 1.2,
                px: 2,
                mx: 1,
                my: 0.5,
                borderRadius: '12px',
                '&:hover': { 
                  backgroundColor: `${item.color}10`,
                },
                '&.Mui-selected': { 
                  backgroundColor: `${item.color}20`,
                  borderLeft: `4px solid ${item.color}`,
                },
                '& .MuiListItemIcon-root': {
                  color: location.pathname === item.path ? item.color : themeColors.neutral.text.secondary,
                },
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === item.path ? '600' : '400',
                  color: location.pathname === item.path ? item.color : themeColors.neutral.text.primary,
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;