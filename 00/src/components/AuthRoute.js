// src/components/AuthRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthRoute = ({ children, adminOnly = false, superAdminOnly = false }) => {
  const { user, isAdmin, isSuperAdmin, isLoading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setChecked(true);
      console.log("AuthRoute check:", { 
        user, 
        isAdmin: isAdmin(), 
        isSuperAdmin: isSuperAdmin(),
        adminOnly,
        superAdminOnly
      }); // Debug log
    }
  }, [isLoading, user, isAdmin, isSuperAdmin, adminOnly, superAdminOnly]);

  if (!checked) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (superAdminOnly && !isSuperAdmin()) {
    console.log("Superadmin access required, but user is not superadmin");
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin()) {
    console.log("Admin access required, but user is not admin");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthRoute;