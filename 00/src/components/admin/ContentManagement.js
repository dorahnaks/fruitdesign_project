import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { themeColors } from '../../theme/Colors';
import contentAPI from '../../api/ContentAPI';
import { useAuth } from '../../context/AuthContext';
import { Edit, Delete, Add } from '@mui/icons-material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const BestSellersManagement = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    fetchBestSellers();
    fetchProducts();
  }, []);

  const fetchBestSellers = async () => {
    try {
      const response = await contentAPI.getBestSellers();
      setBestSellers(response);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await contentAPI.getAllProducts();
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddBestSeller = async () => {
    try {
      await contentAPI.addBestSeller({ product_id: selectedProduct, display_order: displayOrder }, token);
      setOpen(false);
      setSelectedProduct('');
      setDisplayOrder(0);
      fetchBestSellers();
    } catch (error) {
      console.error('Error adding best seller:', error);
    }
  };

  const handleDeleteBestSeller = async (id) => {
    if (window.confirm('Are you sure you want to remove this product from best sellers?')) {
      try {
        await contentAPI.deleteBestSeller(id, token);
        fetchBestSellers();
      } catch (error) {
        console.error('Error deleting best seller:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Best Sellers</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add Best Seller</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Display Order</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bestSellers.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.product ? item.product.name : 'N/A'}</TableCell>
                <TableCell>${item.product ? item.product.price.toFixed(2) : 'N/A'}</TableCell>
                <TableCell>{item.display_order}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDeleteBestSeller(item.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Best Seller</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Product</InputLabel>
            <Select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Display Order"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddBestSeller}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const HealthTipsManagement = () => {
  const [healthTips, setHealthTips] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTip, setEditingTip] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    color: '',
    category: ''
  });
  const { token } = useAuth();

  useEffect(() => {
    fetchHealthTips();
  }, []);

  const fetchHealthTips = async () => {
    try {
      const response = await contentAPI.getHealthTips();
      setHealthTips(response);
    } catch (error) {
      console.error('Error fetching health tips:', error);
    }
  };

  const handleAddTip = async () => {
    try {
      if (editingTip) {
        await contentAPI.updateHealthTip(editingTip.id, formData, token);
      } else {
        await contentAPI.addHealthTip(formData, token);
      }
      setOpen(false);
      setEditingTip(null);
      setFormData({
        title: '',
        description: '',
        icon: '',
        color: '',
        category: ''
      });
      fetchHealthTips();
    } catch (error) {
      console.error('Error saving health tip:', error);
    }
  };

  const handleEditTip = (tip) => {
    setEditingTip(tip);
    setFormData({
      title: tip.title,
      description: tip.description,
      icon: tip.icon,
      color: tip.color,
      category: tip.category
    });
    setOpen(true);
  };

  const handleDeleteTip = async (tipId) => {
    if (window.confirm('Are you sure you want to delete this health tip?')) {
      try {
        await contentAPI.deleteHealthTip(tipId, token);
        fetchHealthTips();
      } catch (error) {
        console.error('Error deleting health tip:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Health Tips</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add Health Tip</Button>
      </Box>
      <Grid container spacing={2}>
        {healthTips.map((tip) => (
          <Grid item xs={12} md={6} lg={4} key={tip.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" component="div">
                    {tip.title}
                  </Typography>
                  <Chip label={tip.category} size="small" sx={{ backgroundColor: tip.color, color: '#fff' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {tip.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <IconButton color="primary" onClick={() => handleEditTip(tip)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDeleteTip(tip.id)}><Delete /></IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={() => {
        setOpen(false);
        setEditingTip(null);
        setFormData({
          title: '',
          description: '',
          icon: '',
          color: '',
          category: ''
        });
      }}>
        <DialogTitle>{editingTip ? 'Edit Health Tip' : 'Add Health Tip'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            label="Icon"
            value={formData.icon}
            onChange={(e) => setFormData({...formData, icon: e.target.value})}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Color"
            value={formData.color}
            onChange={(e) => setFormData({...formData, color: e.target.value})}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <MenuItem value="nutrition">Nutrition</MenuItem>
              <MenuItem value="exercise">Exercise</MenuItem>
              <MenuItem value="lifestyle">Lifestyle</MenuItem>
              <MenuItem value="wellness">Wellness</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            setEditingTip(null);
            setFormData({
              title: '',
              description: '',
              icon: '',
              color: '',
              category: ''
            });
          }}>Cancel</Button>
          <Button onClick={handleAddTip}>{editingTip ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const CompanyInfoManagement = () => {
  const [companyInfo, setCompanyInfo] = useState({});
  const [editingInfo, setEditingInfo] = useState(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const response = await contentAPI.getCompanyInfo();
      setCompanyInfo(response);
    } catch (error) {
      console.error('Error fetching company info:', error);
    }
  };

  const handleEditInfo = (key, currentValue) => {
    setEditingInfo(key);
    setValue(currentValue);
    setOpen(true);
  };

  const handleUpdateInfo = async () => {
    try {
      await contentAPI.updateCompanyInfo(editingInfo, value, token);
      setOpen(false);
      setEditingInfo(null);
      setValue('');
      fetchCompanyInfo();
    } catch (error) {
      console.error('Error updating company info:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Company Information</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(companyInfo).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell>{key}</TableCell>
                <TableCell>{value}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEditInfo(key, value)}><Edit /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => {
        setOpen(false);
        setEditingInfo(null);
        setValue('');
      }}>
        <DialogTitle>Edit Company Information</DialogTitle>
        <DialogContent>
          <TextField
            label="Key"
            value={editingInfo || ''}
            disabled
            fullWidth
            margin="normal"
          />
          <TextField
            label="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            setEditingInfo(null);
            setValue('');
          }}>Cancel</Button>
          <Button onClick={handleUpdateInfo}>Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const TeamMembersManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    image_url: '',
    linkedin_url: '',
    twitter_url: '',
    display_order: 0
  });
  const { token } = useAuth();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await contentAPI.getTeamMembers();
      setTeamMembers(response);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleAddMember = async () => {
    try {
      if (editingMember) {
        await contentAPI.updateTeamMember(editingMember.id, formData, token);
      } else {
        await contentAPI.addTeamMember(formData, token);
      }
      setOpen(false);
      setEditingMember(null);
      setFormData({
        name: '',
        role: '',
        bio: '',
        image_url: '',
        linkedin_url: '',
        twitter_url: '',
        display_order: 0
      });
      fetchTeamMembers();
    } catch (error) {
      console.error('Error saving team member:', error);
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image_url: member.image_url || '',
      linkedin_url: member.linkedin_url || '',
      twitter_url: member.twitter_url || '',
      display_order: member.display_order
    });
    setOpen(true);
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await contentAPI.deleteTeamMember(id, token);
        fetchTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Team Members</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add Team Member</Button>
      </Box>
      <Grid container spacing={2}>
        {teamMembers.map((member) => (
          <Grid item xs={12} md={6} lg={4} key={member.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  {member.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {member.role}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {member.bio}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <IconButton color="primary" onClick={() => handleEditMember(member)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDeleteMember(member.id)}><Delete /></IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={() => {
        setOpen(false);
        setEditingMember(null);
        setFormData({
          name: '',
          role: '',
          bio: '',
          image_url: '',
          linkedin_url: '',
          twitter_url: '',
          display_order: 0
        });
      }}>
        <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Bio"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            label="Image URL"
            value={formData.image_url}
            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            fullWidth
            margin="normal"
          />
          <TextField
            label="LinkedIn URL"
            value={formData.linkedin_url}
            onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Twitter URL"
            value={formData.twitter_url}
            onChange={(e) => setFormData({...formData, twitter_url: e.target.value})}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Display Order"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            setEditingMember(null);
            setFormData({
              name: '',
              role: '',
              bio: '',
              image_url: '',
              linkedin_url: '',
              twitter_url: '',
              display_order: 0
            });
          }}>Cancel</Button>
          <Button onClick={handleAddMember}>{editingMember ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const CompanyStatsManagement = () => {
  const [companyStats, setCompanyStats] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingStat, setEditingStat] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    value: '',
    display_order: 0
  });
  const { token } = useAuth();

  useEffect(() => {
    fetchCompanyStats();
  }, []);

  const fetchCompanyStats = async () => {
    try {
      const response = await contentAPI.getCompanyStats();
      setCompanyStats(response);
    } catch (error) {
      console.error('Error fetching company stats:', error);
    }
  };

  const handleAddStat = async () => {
    try {
      if (editingStat) {
        await contentAPI.updateCompanyStat(editingStat.id, formData, token);
      } else {
        await contentAPI.addCompanyStat(formData, token);
      }
      setOpen(false);
      setEditingStat(null);
      setFormData({
        label: '',
        value: '',
        display_order: 0
      });
      fetchCompanyStats();
    } catch (error) {
      console.error('Error saving company stat:', error);
    }
  };

  const handleEditStat = (stat) => {
    setEditingStat(stat);
    setFormData({
      label: stat.label,
      value: stat.value,
      display_order: stat.display_order
    });
    setOpen(true);
  };

  const handleDeleteStat = async (id) => {
    if (window.confirm('Are you sure you want to delete this company stat?')) {
      try {
        await contentAPI.deleteCompanyStat(id, token);
        fetchCompanyStats();
      } catch (error) {
        console.error('Error deleting company stat:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Company Stats</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add Stat</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Display Order</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companyStats.map((stat) => (
              <TableRow key={stat.id}>
                <TableCell>{stat.id}</TableCell>
                <TableCell>{stat.label}</TableCell>
                <TableCell>{stat.value}</TableCell>
                <TableCell>{stat.display_order}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEditStat(stat)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDeleteStat(stat.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => {
        setOpen(false);
        setEditingStat(null);
        setFormData({
          label: '',
          value: '',
          display_order: 0
        });
      }}>
        <DialogTitle>{editingStat ? 'Edit Company Stat' : 'Add Company Stat'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Label"
            value={formData.label}
            onChange={(e) => setFormData({...formData, label: e.target.value})}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Value"
            value={formData.value}
            onChange={(e) => setFormData({...formData, value: e.target.value})}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Display Order"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            setEditingStat(null);
            setFormData({
              label: '',
              value: '',
              display_order: 0
            });
          }}>Cancel</Button>
          <Button onClick={handleAddStat}>{editingStat ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const QuickTipsManagement = () => {
  const [quickTips, setQuickTips] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTip, setEditingTip] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: ''
  });
  const { token } = useAuth();

  useEffect(() => {
    fetchQuickTips();
  }, []);

  const fetchQuickTips = async () => {
    try {
      const response = await contentAPI.getQuickTips();
      setQuickTips(response);
    } catch (error) {
      console.error('Error fetching quick tips:', error);
    }
  };

  const handleAddTip = async () => {
    try {
      if (editingTip) {
        await contentAPI.updateQuickTip(editingTip.id, formData, token);
      } else {
        await contentAPI.addQuickTip(formData, token);
      }
      setOpen(false);
      setEditingTip(null);
      setFormData({
        title: '',
        description: '',
        icon: ''
      });
      fetchQuickTips();
    } catch (error) {
      console.error('Error saving quick tip:', error);
    }
  };

  const handleEditTip = (tip) => {
    setEditingTip(tip);
    setFormData({
      title: tip.title,
      description: tip.description,
      icon: tip.icon
    });
    setOpen(true);
  };

  const handleDeleteTip = async (tipId) => {
    if (window.confirm('Are you sure you want to delete this quick tip?')) {
      try {
        await contentAPI.deleteQuickTip(tipId, token);
        fetchQuickTips();
      } catch (error) {
        console.error('Error deleting quick tip:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Quick Tips</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add Quick Tip</Button>
      </Box>
      <Grid container spacing={2}>
        {quickTips.map((tip) => (
          <Grid item xs={12} md={6} lg={4} key={tip.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  {tip.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {tip.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <IconButton color="primary" onClick={() => handleEditTip(tip)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDeleteTip(tip.id)}><Delete /></IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={() => {
        setOpen(false);
        setEditingTip(null);
        setFormData({
          title: '',
          description: '',
          icon: ''
        });
      }}>
        <DialogTitle>{editingTip ? 'Edit Quick Tip' : 'Add Quick Tip'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            label="Icon"
            value={formData.icon}
            onChange={(e) => setFormData({...formData, icon: e.target.value})}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            setEditingTip(null);
            setFormData({
              title: '',
              description: '',
              icon: ''
            });
          }}>Cancel</Button>
          <Button onClick={handleAddTip}>{editingTip ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const ContentManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Content Management</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="content management tabs">
          <Tab label="Best Sellers" id="content-tab-0" />
          <Tab label="Health Tips" id="content-tab-1" />
          <Tab label="Company Info" id="content-tab-2" />
          <Tab label="Team Members" id="content-tab-3" />
          <Tab label="Company Stats" id="content-tab-4" />
          <Tab label="Quick Tips" id="content-tab-5" />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <BestSellersManagement />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <HealthTipsManagement />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <CompanyInfoManagement />
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <TeamMembersManagement />
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        <CompanyStatsManagement />
      </TabPanel>
      <TabPanel value={tabValue} index={5}>
        <QuickTipsManagement />
      </TabPanel>
    </Box>
  );
};

export default ContentManagement;