import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const RoleRoute = ({ allowedRoles, children }) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    toast.error(`Access Denied. Required roles: ${allowedRoles.join(', ')}`);
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleRoute;
