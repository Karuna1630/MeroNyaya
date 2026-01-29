import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const normalizeRole = (user) => {
  if (!user) return null;
  if (user.is_superuser || user.is_staff) return 'admin';
  const raw = user.user_type || user.role || user.type;
  return typeof raw === 'string' ? raw.toLowerCase() : null;
};

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = null }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const role = normalizeRole(user);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check user role
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? "/admindashboard" : "/"} replace />;
  }

  // If a list of allowed roles is provided, enforce it
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'admin' ? "/admindashboard" : "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
