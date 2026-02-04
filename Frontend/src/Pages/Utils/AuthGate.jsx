import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * AuthGate Component
 * Wraps protected actions within a public page
 * If user is not authenticated, redirects to login with return path
 * If authenticated, renders children
 */
const AuthGate = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login with the current path as return destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthGate;
