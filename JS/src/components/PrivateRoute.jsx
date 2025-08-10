// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to={`/auth/sign-in?redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};

export default PrivateRoute;
