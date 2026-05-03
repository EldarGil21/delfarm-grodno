import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Загрузка...</div>;
  }

  // Проверка авторизации и роли 'admin'
  if (!isLoggedIn || user?.role !== 'admin') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;