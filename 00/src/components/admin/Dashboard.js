import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  useTheme,
  Avatar,
  Chip,
  Button,
  LinearProgress,
  Paper
} from '@mui/material';
import { 
  People, 
  ShoppingCart, 
  Assignment, 
  Feedback, 
  TrendingUp, 
  Category, 
  Assessment, 
  EventNote,
  AttachMoney,
  LocalShipping,
  Star,
  Refresh,
  MoreVert,
  Inventory,
  Storefront,
  PointOfSale
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { themeColors } from '../../theme/Colors';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Card sx={{ 
        backgroundColor: themeColors.neutral.card, 
        border: `1px solid ${themeColors.neutral.border}`,
        borderRadius: 1,
        boxShadow: themeColors.shadow.medium,
        p: 1
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: themeColors.neutral.text.primary }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon, trend, color }) => (
  <Card sx={{ 
    backgroundColor: themeColors.neutral.card,
    borderRadius: '16px',
    transition: 'all 0.3s ease',
    '&:hover': { 
      transform: 'translateY(-5px)', 
      boxShadow: themeColors.shadow.hover,
    },
    height: '100%',
    boxShadow: themeColors.shadow.light,
    overflow: 'hidden',
    position: 'relative'
  }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
      <Box sx={{ 
        width: 64, 
        height: 64, 
        borderRadius: '16px', 
        background: `linear-gradient(135deg, ${color}, ${color}80)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 3,
        boxShadow: themeColors.shadow.light
      }}>
        {React.cloneElement(icon, { sx: { fontSize: 32, color: themeColors.neutral.text.light } })}
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: themeColors.neutral.text.primary }}>{value}</Typography>
        <Typography variant="body2" color="textSecondary">{title}</Typography>
        <Typography variant="caption" sx={{ color, fontWeight: 500 }}>
          {trend}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// Chart Card Component
const ChartCard = ({ title, subtitle, icon, children, action, height = 350 }) => (
  <Card sx={{ 
    borderRadius: '16px', 
    backgroundColor: themeColors.neutral.card,
    height: '100%',
    boxShadow: themeColors.shadow.light,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <CardHeader 
      title={title} 
      titleTypographyProps={{ fontWeight: 'bold', color: themeColors.neutral.text.primary }}
      subheader={subtitle}
      subheaderTypographyProps={{ color: 'textSecondary' }}
      avatar={
        <Box sx={{ 
          width: 48, 
          height: 48, 
          borderRadius: '12px', 
          background: themeColors.gradient.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: themeColors.shadow.light
        }}>
          {React.cloneElement(icon, { sx: { fontSize: 28, color: themeColors.neutral.text.light } })}
        </Box>
      }
      action={action}
    />
    <Divider />
    <CardContent sx={{ p: 2, flexGrow: 1, minHeight: height }}>
      {children}
    </CardContent>
  </Card>
);

// Recent Orders Table Component
const RecentOrdersTable = ({ orders }) => (
  <TableContainer sx={{ maxHeight: 400 }}>
    <Table stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell sx={{ backgroundColor: themeColors.neutral.background, fontWeight: 'bold' }}>Order ID</TableCell>
          <TableCell sx={{ backgroundColor: themeColors.neutral.background, fontWeight: 'bold' }}>Customer</TableCell>
          <TableCell sx={{ backgroundColor: themeColors.neutral.background, fontWeight: 'bold' }}>Date</TableCell>
          <TableCell sx={{ backgroundColor: themeColors.neutral.background, fontWeight: 'bold' }}>Amount</TableCell>
          <TableCell sx={{ backgroundColor: themeColors.neutral.background, fontWeight: 'bold' }}>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id} hover>
            <TableCell>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: themeColors.neutral.text.primary }}>
                #{order.id}
              </Typography>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  mr: 1, 
                  width: 32, 
                  height: 32, 
                  backgroundColor: themeColors.primary.main,
                  color: themeColors.neutral.text.light
                }}>
                  {order.customer.charAt(0)}
                </Avatar>
                <Typography variant="body2" color="textSecondary">
                  {order.customer}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Typography variant="body2" color="textSecondary">
                {order.date}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: themeColors.neutral.text.primary }}>
                ${order.amount.toFixed(2)}
              </Typography>
            </TableCell>
            <TableCell>
              <Chip 
                label={order.status} 
                size="small"
                sx={{ 
                  backgroundColor: order.status === 'Delivered' ? `${themeColors.status.success}20` : 
                                  order.status === 'Processing' ? `${themeColors.status.info}20` :
                                  order.status === 'Shipped' ? `${themeColors.status.warning}20` :
                                  `${themeColors.status.error}20`,
                  color: order.status === 'Delivered' ? themeColors.status.success : 
                          order.status === 'Processing' ? themeColors.status.info :
                          order.status === 'Shipped' ? themeColors.status.warning :
                          themeColors.status.error,
                  fontWeight: 'bold',
                  borderRadius: '6px'
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// Top Products Component
const TopProducts = ({ products }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {products.map((product, index) => (
      <Box key={product.id} sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: '8px', '&:hover': { backgroundColor: themeColors.neutral.background } }}>
        <Avatar sx={{ 
          mr: 2, 
          width: 40, 
          height: 40, 
          backgroundColor: themeColors.primary.main,
          color: themeColors.neutral.text.light
        }}>
          {product.name.charAt(0)}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{product.name}</Typography>
          <Typography variant="caption" color="textSecondary">{product.sales} sales</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1, color: product.change > 0 ? themeColors.status.success : themeColors.status.error }}>
            {product.change > 0 ? '+' : ''}{product.change}%
          </Typography>
          {product.change > 0 ? (
            <TrendingUp sx={{ color: themeColors.status.success, fontSize: '1rem' }} />
          ) : (
            <TrendingUp sx={{ color: themeColors.status.error, fontSize: '1rem', transform: 'rotate(180deg)' }} />
          )}
        </Box>
      </Box>
    ))}
  </Box>
);

// Main Dashboard Component
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    pendingOrders: 0,
    unreadFeedback: 0,
    revenue: 0,
    conversionRate: 0,
    stores: 0,
    promotions: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  
  const refreshData = async () => {
    setRefreshing(true);
    try {
      // Simulate API calls with setTimeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stats data
      setStats({
        customers: 120,
        products: 86,
        pendingOrders: 7,
        unreadFeedback: 6,
        revenue: 150000,
        promotions: 5
      });
      
      // Sales data
      setSalesData([
        { name: 'Jan', revenue: 4000, target: 4500 },
        { name: 'Feb', revenue: 3000, target: 3500 },
        { name: 'Mar', revenue: 2000, target: 2500 },
        { name: 'Apr', revenue: 2780, target: 3000 },
        { name: 'May', revenue: 1890, target: 2000 },
        { name: 'Jun', revenue: 2390, target: 2500 },
        { name: 'Jul', revenue: 3490, target: 3500 },
      ]);
      
      // Category data
      setCategoryData([
        { name: 'Fruits', value: 400, color: themeColors.primary.main },
        { name: 'Vegetables', value: 300, color: themeColors.status.success },
        { name: 'Juices', value: 200, color: themeColors.secondary.main },
        { name: 'Salads', value: 150, color: themeColors.accent.main },
        { name: 'Desserts', value: 100, color: themeColors.status.warning },
      ]);
      
      // Recent orders
      setRecentOrders([
        { id: 'ORD-001', customer: 'John Doe', date: '2023-05-15', amount: 45.99, status: 'Delivered' },
        { id: 'ORD-002', customer: 'Jane Smith', date: '2023-05-16', amount: 32.50, status: 'Processing' },
        { id: 'ORD-003', customer: 'Robert Johnson', date: '2023-05-17', amount: 78.25, status: 'Shipped' },
        { id: 'ORD-004', customer: 'Emily Davis', date: '2023-05-18', amount: 56.75, status: 'Delivered' },
        { id: 'ORD-005', customer: 'Michael Wilson', date: '2023-05-19', amount: 29.99, status: 'Pending' },
      ]);
      
      // Top products
      setTopProducts([
        { id: 1, name: 'Fresh Apples', sales: 245, change: 12 },
        { id: 2, name: 'Organic Bananas', sales: 198, change: 8 },
        { id: 3, name: 'Orange Juice', sales: 176, change: -3 },
        { id: 4, name: 'Mixed Berries', sales: 154, change: 15 },
        { id: 5, name: 'Garden Salad', sales: 132, change: 5 },
      ]);
      
      // Customer data
      setCustomerData([
        { name: 'Jan', new: 40, returning: 120 },
        { name: 'Feb', new: 30, returning: 110 },
        { name: 'Mar', new: 20, returning: 100 },
        { name: 'Apr', new: 27, returning: 130 },
        { name: 'May', new: 18, returning: 90 },
        { name: 'Jun', new: 23, returning: 110 },
        { name: 'Jul', new: 34, returning: 140 },
      ]);
      
      // Revenue data
      setRevenueData([
        { name: 'Jan', revenue: 4000, profit: 1200 },
        { name: 'Feb', revenue: 3000, profit: 900 },
        { name: 'Mar', revenue: 2000, profit: 600 },
        { name: 'Apr', revenue: 2780, profit: 834 },
        { name: 'May', revenue: 1890, profit: 567 },
        { name: 'Jun', revenue: 2390, profit: 717 },
        { name: 'Jul', revenue: 3490, profit: 1047 },
      ]);
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    refreshData();
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography variant="h6" align="center" sx={{ mb: 2, color: themeColors.primary.main }}>
            Loading Dashboard
          </Typography>
          <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      backgroundColor: themeColors.neutral.background, 
      minHeight: '100vh',
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        pb: 2,
        borderBottom: `1px solid ${themeColors.neutral.divider}`
      }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: themeColors.primary.main }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Welcome back! Here's what's happening with your business today.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />} 
          onClick={refreshData}
          disabled={refreshing}
          sx={{ 
            borderRadius: '12px',
            px: 3,
            py: 1,
            borderColor: themeColors.primary.main,
            color: themeColors.primary.main,
            '&:hover': { 
              backgroundColor: `${themeColors.primary.main}10`,
              borderColor: themeColors.primary.dark
            }
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard 
            title="Customers"
            value={stats.customers}
            subtitle="Total customers"
            icon={<People />}
            trend="+12% from last month"
            color={themeColors.primary.main}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard 
            title="Products"
            value={stats.products}
            subtitle="Total products"
            icon={<ShoppingCart />}
            trend="+5 new this week"
            color={themeColors.secondary.main}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard 
            title="Pending Orders"
            value={stats.pendingOrders}
            subtitle="Orders to process"
            icon={<Assignment />}
            trend="-8% from yesterday"
            color={themeColors.status.warning}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard 
            title="Promotions"
            value={stats.promotions}
            subtitle="Active promotions"
            icon={<PointOfSale />}
            trend="3 ending soon"
            color={themeColors.status.info}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard 
            title="Feedback"
            value={stats.unreadFeedback}
            subtitle="Unread messages"
            icon={<Feedback />}
            trend="3 urgent"
            color={themeColors.status.error}
          />
        </Grid>
      </Grid>
      
      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={4}>
          <ChartCard 
            title="Revenue Analysis" 
            subtitle="Monthly revenue vs target"
            icon={<TrendingUp />}
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.neutral.divider} />
                <XAxis dataKey="name" stroke={themeColors.neutral.text.secondary} />
                <YAxis stroke={themeColors.neutral.text.secondary} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={themeColors.primary.main} 
                  name="Actual Revenue (UGX)" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke={themeColors.secondary.main} 
                  name="Target Revenue (UGX)" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <ChartCard 
            title="Sales by Category" 
            subtitle="Product category distribution"
            icon={<Category />}
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <ChartCard 
            title="Customer Acquisition" 
            subtitle="New vs returning customers"
            icon={<People />}
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={customerData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.neutral.divider} />
                <XAxis dataKey="name" stroke={themeColors.neutral.text.secondary} />
                <YAxis stroke={themeColors.neutral.text.secondary} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="new" 
                  stackId="1" 
                  stroke={themeColors.primary.main} 
                  fill={themeColors.primary.main}
                  fillOpacity={0.3}
                  name="New Customers"
                />
                <Area 
                  type="monotone" 
                  dataKey="returning" 
                  stackId="1" 
                  stroke={themeColors.secondary.main} 
                  fill={themeColors.secondary.main}
                  fillOpacity={0.3}
                  name="Returning Customers"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
      
      {/* Bottom Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            borderRadius: '16px', 
            backgroundColor: themeColors.neutral.card,
            boxShadow: themeColors.shadow.light,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            <CardHeader 
              title="Recent Orders" 
              titleTypographyProps={{ fontWeight: 'bold', color: themeColors.neutral.text.primary }}
              subheader="Latest customer orders"
              subheaderTypographyProps={{ color: 'textSecondary' }}
              avatar={
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '12px', 
                  background: themeColors.gradient.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: themeColors.shadow.light
                }}>
                  <Assignment sx={{ color: themeColors.neutral.text.light }} />
                </Box>
              }
              action={
                <Typography variant="button" sx={{ 
                  color: themeColors.primary.main,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}>
                  View All
                </Typography>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0, flexGrow: 1 }}>
              <RecentOrdersTable orders={recentOrders} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            borderRadius: '16px', 
            backgroundColor: themeColors.neutral.card,
            boxShadow: themeColors.shadow.light,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardHeader 
              title="Top Products" 
              titleTypographyProps={{ fontWeight: 'bold', color: themeColors.neutral.text.primary }}
              subheader="Best performing products"
              subheaderTypographyProps={{ color: 'textSecondary' }}
              avatar={
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '12px', 
                  background: themeColors.gradient.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: themeColors.shadow.light
                }}>
                  <ShoppingCart sx={{ color: themeColors.neutral.text.light }} />
                </Box>
              }
            />
            <Divider />
            <CardContent sx={{ p: 2, flexGrow: 1 }}>
              <TopProducts products={topProducts} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;