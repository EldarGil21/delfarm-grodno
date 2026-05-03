import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FarmerRoute = ({ children }) => {
  const { user, isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Загрузка...</div>;
  }

  // Реализация проверки: авторизован ли пользователь И является ли он фермером
  if (!isLoggedIn || user?.role !== 'farmer') {
    // Если нет, то происходит перенаправление на главную страницу
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default FarmerRoute;