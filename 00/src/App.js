import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Contact from './pages/Contact';
import HealthTips from './pages/HealthTips';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import CartModal from './components/CartModal';
import CartNotification from './components/CartNotification';
import './App.css';
import Cart from './components/Cart';
import CheckoutForm from './pages/CheckoutForm';
import OrderConfirmation from './components/OrderConfirmation';
import CustomerProfile from './pages/CustomerProfile';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AuthRoute from './components/AuthRoute';
import CustomerManagement from './components/admin/CustomerManagement';
import ProductManagement from './components/admin/ProductManagement';
import OrderManagement from './components/admin/OrderManagement';
import FeedbackManagement from './components/admin/FeedbackManagement';
import AdminManagement from './components/admin/AdminManagement';
import ContactSettings from './components/admin/ContactSettings';
import Dashboard from './components/admin/Dashboard'; 
import AdminProfile from './components/admin/AdminProfile';
import ContentManagement from './components/admin/ContentManagement';

// Create a Layout component for customer pages
const CustomerLayout = ({ children }) => (
  <>
    <Header />
    <CartModal />
    <CartNotification />
    <main className="main-content">
      {children}
    </main>
    <Footer />
  </>
);

// Protected Route component for authenticated users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { isAuthenticated, isLoading, isAdmin, isSuperAdmin } = useAuth();
  
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (isAdmin() || isSuperAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Role-based redirect route */}
              <Route path="/redirect" element={<RoleBasedRedirect />} />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <AuthRoute adminOnly={true}>
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="customers" element={<CustomerManagement />} />
                      <Route path="products" element={<ProductManagement />} />
                      <Route path="orders" element={<OrderManagement />} />
                      <Route path="feedback" element={<FeedbackManagement />} />
                      <Route path="content" element={<ContentManagement />} />
                      {/* Superadmin only routes */}
                      <Route path="admins" element={
                        <AuthRoute superAdminOnly={true}>
                          <AdminManagement />
                        </AuthRoute>
                      } />
                      <Route path="contact" element={<ContactSettings />} />
                      <Route path="profile" element={<AdminProfile />} />
                      <Route path="*" element={<Dashboard />} />
                    </Routes>
                  </AdminLayout>
                </AuthRoute>
              } />
              
              {/* Customer Routes */}
              <Route path="/" element={
                <CustomerLayout>
                  <Home />
                </CustomerLayout>
              } />
              <Route path="/about" element={
                <CustomerLayout>
                  <About />
                </CustomerLayout>
              } />
              <Route path="/products" element={
                <CustomerLayout>
                  <Products />
                </CustomerLayout>
              } />
              <Route path="/contact" element={
                <CustomerLayout>
                  <Contact />
                </CustomerLayout>
              } />
              <Route path="/health-tips" element={
                <CustomerLayout>
                  <HealthTips />
                </CustomerLayout>
              } />
              <Route path="/login" element={
                <CustomerLayout>
                  <Login />
                </CustomerLayout>
              } />
              <Route path="/signup" element={
                <CustomerLayout>
                  <Signup />
                </CustomerLayout>
              } />
              <Route path="/cart" element={
                <CustomerLayout>
                  <Cart />
                </CustomerLayout>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <CustomerLayout>
                    <CheckoutForm />
                  </CustomerLayout>
                </ProtectedRoute>
              } />
              <Route path="/order-confirmation" element={
                <ProtectedRoute>
                  <CustomerLayout>
                    <OrderConfirmation />
                  </CustomerLayout>
                </ProtectedRoute>
              } />
              <Route path="/account" element={
                <ProtectedRoute>
                  <CustomerLayout>
                    <CustomerProfile />
                  </CustomerLayout>
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={
                <CustomerLayout>
                  <Home />
                </CustomerLayout>
              } />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;